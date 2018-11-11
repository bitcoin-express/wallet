import { DEFAULT_SETTINGS } from '../WalletBF';
import { encrypt, decrypt } from './Encrypt';

// https://developers.google.com/drive/v3/reference/files
// https://console.developers.google.com/apis/dashboard

const settings = {
  client_id: '1007187498420-hqifjq3p5e585463v41uchoqevcsu0sd.apps.googleusercontent.com',
  discovery_docs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  scopes: 'https://www.googleapis.com/auth/drive.file',
};

/*
 * DISCOVERY_DOCS
 *  - Array of API discovery doc URLs for APIs used by the quickstart
 *  - i.e. ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
 *
 * SCOPES
 *  - Authorization scopes required by the API; multiple scopes can be
 *    included, separated by spaces.
 *  - i.e. 'https://www.googleapis.com/auth/drive.metadata.readonly'
 *  - list of scopes (OAuth): https://developers.google.com/drive/v3/web/about-auth
 */
export default class GoogleDrive {

  constructor(handleDataLocked) {
    this.CLIENT_ID = settings.client_id;
    this.DISCOVERY_DOCS = settings.discovery_docs;
    this.SCOPES = settings.scopes;

    this.isSignedIn = false;

    // wallet files
    this.walletFile = "wallet.json"
    this.infoFile = "wallet.info.json"
    this.lockFile = "wallet.lock.json"
    this.boundary = '-------314159265358979323846';
    this.contentType = 'application/json';

    // folder where files are saved
    this.appFolder = "Bitcoin-express";

    this.handleDataLocked = handleDataLocked;
    this.handleClientLoad = this.handleClientLoad.bind(this);
    this.handleAuthClick = this.handleAuthClick.bind(this);
    this.handleSignoutClick = this.handleSignoutClick.bind(this);

    this.initializeStorage = this.initializeStorage.bind(this);
    this._updateAppFolderId = this._updateAppFolderId.bind(this);
    this._updateInfoId = this._updateInfoId.bind(this);
    this._updateWalletContent = this._updateWalletContent.bind(this);
    this._readWallet = this._readWallet.bind(this);

    this.createFiles = this.createFiles.bind(this);
    this._createAppFolder = this._createAppFolder.bind(this);
    this._createWalletFile = this._createWalletFile.bind(this);
    this._generateGoogleFileId = this._generateGoogleFileId.bind(this);
    this._createInfoFile = this._createInfoFile.bind(this);

    this.sessionStart = this.sessionStart.bind(this);
    this._createLockFile = this._createLockFile.bind(this);
    this._readLockFile = this._readLockFile.bind(this);
    this.sessionEnd = this.sessionEnd.bind(this);

    this._updateInfoFile = this._updateInfoFile.bind(this);

    this.deleteDriveFiles = this.deleteDriveFiles.bind(this);
    this.findIdByName = this.findIdByName.bind(this);
    this.getMultipartRequestBody = this.getMultipartRequestBody.bind(this);
    this.getFileContent = this.getFileContent.bind(this);
    this.createFile = this.createFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.deleteKey = this.deleteKey.bind(this);

    this.setPassword = this.setPassword.bind(this);
    this.setPasswordAndUpdate = this.setPasswordAndUpdate.bind(this);
    this.needsAuthentication = this.needsAuthentication.bind(this);
  }

  setPasswordAndUpdate(pwd="") {
    return this._readWallet().then((success) => {
      this.encrypt = pwd != "";
      this.encryption = pwd;
      return this.flush();
    }).then((fileId) => {
      return true;
    });
  }

  setPassword(pwd="") {
    this.encryption = pwd;
    return this._readWallet();
  }

  needsAuthentication() {
    return this._readWallet(true);
  }

  /**
   *  Must be auto-called when trying to load the Wallet (autologin).
   *  It loads the auth2 library and API client library.
   *  @return A promise that...
   *    resolves true if signedIn
   *    resolves false if not signedIn.
   *    rejects Error type name 'Error' if connection problem with GoogleDrive.
   *    rejects Error type name 'ReferenceError' if files not found in GoogleDrive.
   */
  handleClientLoad() {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', () => {

        const params = {
          discoveryDocs: this.DISCOVERY_DOCS,
          clientId: this.CLIENT_ID,
          cookie_policy: "none",
          scope: this.SCOPES
        };

        gapi.client.init(params).then(() => {
          if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            // User is signed in, try to initializeStorage
            this.initializeStorage().then(() => {
              return resolve(true);
            }).catch(reject);
            return;
          }
          resolve(false);
        }, reject);
      }, reject);
    });
  }

  /**
   * Grant authorization. (Popup window to grant)
   * Sign in the user upon button click.
   */
  handleAuthClick() {
    return new Promise((resolve, reject) => {
      gapi.auth2.getAuthInstance().signIn().then(() => {
        // After granted permission, try to initialize
        this.initializeStorage().then(() => {
          resolve(true);
        }, () => {
          // If not found files, create them.
          this.createFiles().then(() => {
            resolve(true);
          }).catch((err) => {
            reject(err);
          });
        });
      }, function (err) {
        reject(Error("Can't connect to Google Drive"));
      });
    });
  }

  /**
   * Sign out the user upon button click.
   */
  handleSignoutClick() {
    return new Promise((resolve, reject) => {
      gapi.auth2.getAuthInstance().signOut().then(() => {
        this.walletId = null;
        this.infoId = null;
        this.lockId = null;
        this.folderId = null;
        resolve(true);
      }, function () {
        reject(Error("Error on disconnecting to Google Drive"));
      });
    });
  }

  /**
   * Load the wallet in the localStorage and saves required files ids
   * (walletId, lockId, folderId, infoId)
   */
  initializeStorage() {
    return this._updateAppFolderId().then((id) => {
      return this._updateInfoId();
    }).then((id) => {
      return this._updateWalletContent();
    }).then((id) => {
      return true;
    }).catch((err) => {
      return Promise.reject(err);
    });
  }

  /**
   *  Updates the id of the application folder. If not found, returns an error.
   *  return folderId [string]
   */
  _updateAppFolderId() {
    if (this.folderId) {
      return Promise.resolve(this.folderId);
    }

    return this.findIdByName(this.appFolder, false).then((id) => {
      // found the folder
      this.folderId = id;
      return id;
    }, () => {
      return Promise.reject(Error("App folder not found, but signed in"));
    });
  }

  /**
   *  Updates the id of the wallet info file. If not found, creates the file.
   *  return id [string]
   */
  _updateInfoId() {
    if (this.infoId) {
      return Promise.resolve(this.infoId);
    }

    return this.findIdByName(this.infoFile).then((id) => {
      // found the folder
      this.infoId = id;
      return id;
    }, () => {
      return Promise.reject(Error("wallet.info.id not found, but signed in"));
    });
  }

  /**
   * Loads the wallet in the localStorage image
   */
  _updateWalletContent() {
    if (!this.infoId) {
      return Promise.reject(Error("No id for the wallet.info.json file found"));
    }

    if (!this.walletId || !this.lockId) {
      // We need to retrieve the walletId
      return this.getFileContent(this.infoId).then((content) => {
        this.walletId = content.id;
        this.lockId = content.lockId;
        return this._readWallet();
      }, () => {
        return Promise.reject(Error("id detected, but wallet.info.json not found"));
      });
    }

    return this._readWallet();
  }

  /**
   * read the wallet file from Drive and update the localStorage images 
   */
  _readWallet(checkAuth = false) {
    return this.getFileContent(this.walletId).then((content) => {
      if (checkAuth) {
        // Return true if needs authentication
        if (!content) {
          return false;
        }
        if (typeof content == "string") {
          content = JSON.parse(content);
        }
        const keys = Object.keys(content);
        this.encrypt = keys.indexOf("iv") > -1 && keys.indexOf("cipher") > -1;
        return this.encrypt;
      }

      // Return true if read wallet success 
      if (this.encrypt) {
        content = decrypt(content, this.encryption);
      }
      if (typeof content == "string") {
        content = JSON.parse(content);
      }
      this.wallet = content;
      return true;
    });
  }

  /**
   * From scratch - creates folder and initialize wallet.json and wallet.info.json with:
   *  - the id of the wallet.json file
   *  - the id of the future wallet.lock.json files
   * returns the info file id
   */
  createFiles() {
    return this._createAppFolder().then((id) => {
      this.folderId = id;
      return this._createWalletFile();
    }).then((id) => {
      return this._createInfoFile(id);
    }).then((file) => {
      return file.id;
    }).catch((err) => {
      return Promise.reject(Error("Error on creating wallet files"));
    });
  }

  /**
   * create the application folder
   */
  _createAppFolder() {
    const metadata = {
      name: this.appFolder,
      mimeType: "application/vnd.google-apps.folder"
    };
    return new Promise((resolve, reject) => {
      gapi.client.drive.files.create(metadata).execute((file) => {
        resolve(file.id);
      });
    });
  }

  /**
   * create the initial file wallet.json (empty content)
   */
  _createWalletFile() {
    return this.createFile(DEFAULT_SETTINGS, this.walletFile).then((file) => {
      this.wallet = DEFAULT_SETTINGS;
      this.walletId = file.id;
      return file.id;
    });
  }

  _generateGoogleFileId() {
    return new Promise((resolve, reject) => {
      gapi.client.drive.files.generateIds({
        count: 1,
        space: "drive"
      }).execute((result) => {
        resolve(result.ids[0]);
      });
    });
  }

  /**
   * creates file wallet.info.json with wallet file Id in google drive
   * @param id [string]
   */
  _createInfoFile(id) {
    return this._generateGoogleFileId().then((fileId) => {
      let data = {
        id: id,
        lockId: fileId, 
      };
      return this.createFile(data, this.infoFile).then((file) => {
        this.lockId = fileId;
        this.infoId = file.id;
        return file;
      });
    });
  }

  /**
   * updates wallet.info.json with new generated lock file Id
   * @param id [string]
   */
  _updateInfoFile(save = true) {
    return this._generateGoogleFileId().then((fileId) => {
      let data = {
        id: this.walletId,
        lockId: fileId, 
      };
      return this.updateFile(data, this.infoId).then((file) => {
        if (save) {
          this.lockId = fileId;
        }
        return file;
      });
    });
  }

  /**
   * @param act [string] action
   * @param dev [string] device
   * @param timeout [number] time to expire
   */
  sessionStart(act, dev, timeout=15000) {
    const promCreateLock = this._createLockFile(act, dev, timeout);
    const promReadWallet = this._readWallet();
    return new Promise((resolve, reject) => {
      Promise.all([promCreateLock, promReadWallet]).then((responses) => {
        return resolve(true); 
      }).catch((err) => {
        // is Locked
        const oldLockId = this.lockId;
        if (err.name == "ReferenceError" && err.message == "Already locked") {
          // lock file already exists
          this.getFileContent(this.infoId).then((content) => {
            this.lockId = content.lockId; // stored lockId from info file
            return this._readLockFile();
          }).then((response) => {
            const {
              content,
              file,
            } = response;
            const { wallet_name, device, action, expire } = content;

            if (file.trashed && oldLockId !== this.lockId) {
              // file trashed and obsolete previous lockId try with new lockId
              return this.sessionStart(act, dev, timeout).then((result) => {
                resolve(result);
              });
            }

            let timeToExpire = new Date(expire).getTime() - new Date().getTime();
            this.handleDataLocked(timeToExpire < 0, wallet_name, device, action, new Date(expire).getTime()).then(() => {
              if (timeToExpire < 0) {
                // expired. try to remove old lock file and create a new one.
                let auxLockId = this.lockId;
                this._updateInfoFile(false).then((file) => {
                  return this.deleteFile(oldLockId);
                }).then((response) => {
                  return this.getFileContent(this.infoId);
                }).then((content) => {
                  this.lockId = content.lockId;
                  return this.sessionStart(act, dev, timeout);
                }).then((result) => {
                  resolve(result);
                }).catch((err) => {
                  return this.sessionStart(act, dev, timeout).then((result) => {
                    resolve(result);
                  });
                });
              } else {
                // the lock is currently held by someone
                // wait and try again
                let finalTime = new Date(expire).getTime() - new Date().getTime();
                if (finalTime < 0) {
                  return this.sessionStart(act, dev, timeout).then((result) => {
                    resolve(result);
                  });
                } else {
                  console.log(`waiting ${finalTime/1000} seconds to start session again`);
                  setTimeout(() => {
                    return this.sessionStart(act, dev, timeout).then((result) => {
                      resolve(result);
                    });
                  }, finalTime);
                }
              }
            /*}).catch(() => {
              reject(Error("Current operation aborted"));
              return;*/
            });
          }).catch((err) => {
            // lockfile does not exist, try start session again
            return this.sessionStart(act, dev, timeout).then((result) => {
              resolve(result);
            });
          });
        } else {
          reject(Error("Problem on reading wallet content"));
        }
      });
    });
  }

  /**
   * creates file wallet.lock.json
   * @param action [string]
   * @param device [string]
   * @param timeout [number]
   */
  _createLockFile(action, device, timeout) {
    const session_id = Math.random().toString().slice(2);
    let wallet_name = "";
    const persistent = this.get("persistent");
    if (persistent && persistent.walletSettings) {
      wallet_name = this.get("persistent").walletSettings["walletDriveName"];
    }
    let expire = new Date(new Date().getTime() + timeout).toUTCString();
    const data = { session_id, wallet_name, action, device, expire, timeout };
    return this.createFile(data, this.lockFile, this.lockId).then(() => {
      return true;
    }).catch((err) => {
      // file already exists with the provided ID.
      return Promise.reject(ReferenceError("Already locked"));
    });
  }

  _readLockFile() {
    return this.getFileContent(this.lockId, true).then((response) => {
      return response;
    }).catch((err) => {
      return Promise.reject(ReferenceError("Can not read locked"));
    });
  }

  sessionEnd() {
    let lockFileId = this.lockId;
    return this.flush().then(() => {
      // create new file id for the lock
      return this._updateInfoFile();
    }).then(() => {
      return this.deleteFile(lockFileId);
    }).then((id) => {
      return true;
    });
  }

  deleteDriveFiles() {
    return new Promise((resolve, reject) => {
      this.deleteFile(this.walletId).then((resp) => {
        return this.deleteFile(this.infoId);
      }).then((resp) => {
        delete this.walletId;
        delete this.infoId;
        resolve(0);
      });
    });
  }

  /**
   * @param name [string] 
   * @param inAppFolder [bool] if true, checks parentArray contains the app folderId
   * returns Promise that resolve the id of the file
   */
  findIdByName(name, inAppFolder=true) {
    return new Promise((resolve, reject) => {
      // query params: https://developers.google.com/drive/v3/web/search-parameters

      let query = `name = '${name}' and trashed = false`;
      if (inAppFolder) {
        query = `${query} and '${this.folderId}' in parents`;
      } else {
        // looking for the application folder
        query = `${query} and mimeType = 'application/vnd.google-apps.folder'`;
      }

      gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': "nextPageToken, files(id, isAppAuthorized)",
        'q': query
      }).then((response) => {
        if (response.result.files.length > 0) {
          resolve(response.result.files.filter(function (f) {
            return f.isAppAuthorized;
          })[0].id);
        } else {
          reject("File not found");
        }
      });
    });
  }

  getMultipartRequestBody(data, metadata) {
    const delimiter = "\r\n--" + this.boundary + "\r\n";
    const close_delim = "\r\n--" + this.boundary + "--";

    return delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + this.contentType + '\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;
  }

  getFileContent(id, metadata=false) {
    return new Promise((resolve, reject) => {
      gapi.client.request({
        'path': `/drive/v3/files/${id}?alt=media`,
        'method': 'GET'
      }).execute((response) => {
        if (response.error) {
          reject(response.error);
          return;
        }

        if (metadata) {
          gapi.client.drive.files.get({
            'fileId': id,
            'fields': 'trashed,modifiedTime,isAppAuthorized', 
          }).then((fileResponse) => {
            return resolve({
              file: fileResponse.result,
              content: response
            });
          });
        } else {
          return resolve(response);
        }
      });
    });
  }

  createFile(data, name, id=null) {
    
    if (!this.folderId) {
      return Promise.reject(Error("No Application folder located"));
    }

    let metadata = {
      name: name,
      mimeType: this.contentType,
      parents: [this.folderId]
    };

    if (id) {
      metadata.id = id;
    }

    var request = gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: {
        uploadType: 'multipart'
      },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + this.boundary + '"'
      },
      body: this.getMultipartRequestBody(data, metadata)
    });

    return new Promise((resolve, reject) => {
      request.execute((file) => {
        if (file.error) {
          return reject(file);
        }
        return resolve(file);
      });
    });
  }

  updateFile(data, id) {
    if (typeof data == "object") {
      data = JSON.stringify(data);
    }

    return new Promise((resolve, reject) => {
      gapi.client.request({
        path: `/upload/drive/v3/files/${id}`,
        method: 'PATCH',
        params: {
          uploadType: 'media',
          alt: 'json'
        },
        headers: {
          'Content-Type': 'application/javascript; boundary="' + this.boundary + '"'
        },
        body: data
      }).execute((file) => {
        resolve(this.walletId);
      });
    });
  }

  deleteFile(id) {
    return new Promise((resolve, reject) => {
      gapi.client.request({
        'path': `/drive/v3/files/${id}`,
        'method': 'DELETE',
      }).execute(() => {
        resolve(true);
      });
    });
  }

  flush() {
    let wallet = JSON.stringify(this.wallet);
    if (this.encrypt) {
      wallet = encrypt(wallet, this.encryption);
    }
    return new Promise((resolve, reject) => {
      gapi.client.request({
        path: `/upload/drive/v3/files/${this.walletId}`,
        method: 'PATCH',
        params: {
          uploadType: 'media',
          alt: 'json'
        },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + this.boundary + '"'
        },
        body: wallet
      }).execute((file) => {
        resolve(file.id);
      });
    });
  }

  set(key, value) {
    if (!this.wallet) {
      return Promise.reject(Error("No wallet in localStorage for Google Drive"));
    }
    this.wallet[key] = value;
    return Promise.resolve(true);
  }

  get(key, def = null) {
    if (!this.wallet) {
      return def;
    }
    return this.wallet[key] || def;
  }

  deleteKey(key) {
    const value = this.wallet[key];
    delete this.wallet[key];
    return value;
  }
}
