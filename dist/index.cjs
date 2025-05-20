"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  tiged: () => tiged
});
module.exports = __toCommonJS(src_exports);

// node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl = () => typeof document === "undefined" ? new URL(`file:${__filename}`).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var importMetaUrl = /* @__PURE__ */ getImportMetaUrl();

// src/index.ts
var import_node_child_process = require("node:child_process");
var import_node_events = require("node:events");
var fs2 = __toESM(require("node:fs/promises"), 1);
var path2 = __toESM(require("node:path"), 1);
var import_picocolors = __toESM(require("picocolors"), 1);
var import_tar = require("tar");

// src/utils.ts
var import_https_proxy_agent = require("https-proxy-agent");
var child_process = __toESM(require("node:child_process"), 1);
var import_node_fs = require("node:fs");
var fs = __toESM(require("node:fs/promises"), 1);
var https = __toESM(require("node:https"), 1);
var import_node_module = require("node:module");
var import_node_os = require("node:os");
var path = __toESM(require("node:path"), 1);
var tmpDirName = "tmp";
var tigedConfigName = "degit.json";
var getHomeOrTmp = () => (0, import_node_os.homedir)() || (0, import_node_os.tmpdir)();
var homeOrTmp = /* @__PURE__ */ getHomeOrTmp();
var TigedError = class extends Error {
  /**
   * Creates a new instance of {@linkcode TigedError}.
   *
   * @param message - The error message.
   * @param opts - Additional options for the error.
   */
  constructor(message, opts) {
    super(message);
    Object.assign(this, opts);
  }
};
function tryRequire(file, opts) {
  const require2 = (0, import_node_module.createRequire)(importMetaUrl);
  try {
    if (opts && opts.clearCache === true) {
      delete require2.cache[require2.resolve(file)];
    }
    return require2(file);
  } catch (err) {
    return null;
  }
}
async function exec2(command, size = 500) {
  return new Promise((fulfil, reject) => {
    child_process.exec(
      command,
      { maxBuffer: 1024 * size },
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        fulfil({ stdout, stderr });
      }
    );
  }).catch((err) => {
    if (err.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
      return exec2(command, size * 2);
    }
    return Promise.reject(err);
  });
}
async function fetch(url, dest, proxy) {
  return new Promise((fulfil, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      headers: {
        Connection: "close"
      }
    };
    if (proxy) {
      options.agent = new import_https_proxy_agent.HttpsProxyAgent(proxy);
    }
    https.get(options, (response) => {
      const code = response.statusCode;
      if (code == null) {
        return reject(new Error("No status code"));
      }
      if (code >= 400) {
        reject({ code, message: response.statusMessage });
      } else if (code >= 300) {
        if (response.headers.location == null) {
          return reject(new Error("No location header"));
        }
        fetch(response.headers.location, dest, proxy).then(fulfil, reject);
      } else {
        response.pipe((0, import_node_fs.createWriteStream)(dest)).on("finish", () => fulfil()).on("error", reject);
      }
    }).on("error", reject);
  });
}
async function stashFiles(dir, dest) {
  const tmpDir = path.join(dir, tmpDirName);
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch (e) {
    if (!(e instanceof Error && "errno" in e && "syscall" in e && "code" in e)) {
      return;
    }
    if (e.errno !== -2 && e.syscall !== "rmdir" && e.code !== "ENOENT") {
      throw e;
    }
  }
  await fs.mkdir(tmpDir);
  const files = await fs.readdir(dest, { recursive: true });
  for (const file of files) {
    const filePath = path.join(dest, file);
    const targetPath = path.join(tmpDir, file);
    const isDir = await isDirectory(filePath);
    if (isDir) {
      await fs.cp(filePath, targetPath, { recursive: true });
    } else {
      await fs.cp(filePath, targetPath);
      await fs.unlink(filePath);
    }
  }
}
async function unstashFiles(dir, dest) {
  const tmpDir = path.join(dir, tmpDirName);
  const files = await fs.readdir(tmpDir, { recursive: true });
  for (const filename of files) {
    const tmpFile = path.join(tmpDir, filename);
    const targetPath = path.join(dest, filename);
    const isDir = await isDirectory(tmpFile);
    if (isDir) {
      await fs.cp(tmpFile, targetPath, { recursive: true });
    } else {
      if (filename !== tigedConfigName) {
        await fs.cp(tmpFile, targetPath);
      }
      await fs.unlink(tmpFile);
    }
  }
  await fs.rm(tmpDir, { recursive: true, force: true });
}
var pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
};
var isDirectory = async (filePath) => {
  try {
    const stats = await fs.lstat(filePath);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
};
var base = /* @__PURE__ */ path.join(homeOrTmp, ".degit");

// src/index.ts
var { bold, cyan, magenta, red } = import_picocolors.default;
var validModes = /* @__PURE__ */ new Set(["tar", "git"]);
function tiged(src, opts) {
  return new Tiged(src, opts);
}
var Tiged = class extends import_node_events.EventEmitter {
  /**
   * Constructs a new {@linkcode Tiged} instance
   * with the specified source and options.
   *
   * @param src - The source repository string.
   * @param opts - Optional parameters to customize the behavior.
   */
  constructor(src, opts = {}) {
    super();
    this.src = src;
    if (opts["offline-mode"]) this.offlineMode = opts["offline-mode"];
    if (opts.offlineMode) this.offlineMode = opts.offlineMode;
    if (opts["disable-cache"]) this.noCache = opts["disable-cache"];
    if (opts.disableCache) this.noCache = opts.disableCache;
    this.cache = opts.cache;
    this.force = opts.force;
    this.verbose = opts.verbose;
    this.proxy = this._getHttpsProxy();
    this.subgroup = opts.subgroup;
    this.subdir = opts["sub-directory"];
    this.repo = parse(src);
    if (this.subgroup) {
      this.repo.subgroup = true;
      this.repo.name = this.repo.subdir?.slice(1) ?? "";
      this.repo.url += this.repo.subdir;
      this.repo.ssh = `${this.repo.ssh + this.repo.subdir}.git`;
      this.repo.subdir = null;
      if (this.subdir) {
        this.repo.subdir = this.subdir.startsWith("/") ? this.subdir : `/${this.subdir}`;
      }
    }
    this.mode = opts.mode || this.repo.mode;
    if (!validModes.has(this.mode)) {
      throw new Error(`Valid modes are ${Array.from(validModes).join(", ")}`);
    }
    this._hasStashed = false;
    this.directiveActions = {
      clone: async (dir, dest, action) => {
        if (this._hasStashed === false) {
          await stashFiles(dir, dest);
          this._hasStashed = true;
        }
        const opts2 = Object.assign(
          { force: true },
          { cache: action.cache, verbose: action.verbose }
        );
        const t = tiged(action.src, opts2);
        t.on("info", (event) => {
          console.error(cyan(`> ${event.message?.replace("options.", "--")}`));
        });
        t.on("warn", (event) => {
          console.error(
            magenta(`! ${event.message?.replace("options.", "--")}`)
          );
        });
        try {
          await t.clone(dest);
        } catch (err) {
          if (err instanceof Error) {
            console.error(red(`! ${err.message}`));
            process.exit(1);
          }
        }
      },
      remove: this.remove.bind(this)
    };
  }
  // Return the HTTPS proxy address. Try to get the value by environment
  // variable `https_proxy` or `HTTPS_PROXY`.
  //
  // TODO allow setting via --proxy
  /**
   * Retrieves the HTTPS proxy from the environment variables.
   *
   * @returns The HTTPS proxy value, or `undefined` if not found.
   */
  _getHttpsProxy() {
    const result = process.env.https_proxy;
    if (!result) {
      return process.env.HTTPS_PROXY;
    }
    return result;
  }
  /**
   * Retrieves the directives from the specified destination.
   *
   * @param dest - The destination path.
   * @returns An array of {@linkcode TigedAction} directives, or `false` if no directives are found.
   */
  async _getDirectives(dest) {
    const directivesPath = path2.resolve(dest, tigedConfigName);
    const directives = tryRequire(directivesPath, { clearCache: true }) || false;
    if (directives) {
      await fs2.unlink(directivesPath);
    }
    return directives;
  }
  /**
   * Clones the repository to the specified destination.
   *
   * @param dest - The destination directory where the repository will be cloned.
   */
  async clone(dest) {
    try {
      (0, import_node_child_process.execSync)("git --version", { stdio: "ignore" });
    } catch (e) {
      throw new TigedError(
        "could not find git. Make the directory of your git executable is found in your PATH environment variable.",
        {
          code: "MISSING_GIT"
        }
      );
    }
    await this._checkDirIsEmpty(dest);
    const { repo } = this;
    const dir = path2.join(base, repo.site, repo.user, repo.name);
    if (this.mode === "tar") {
      await this._cloneWithTar(dir, dest);
    } else {
      await this._cloneWithGit(dir, dest);
    }
    this._info({
      code: "SUCCESS",
      message: `cloned ${bold(`${repo.user}/${repo.name}`)}#${bold(repo.ref)}${dest !== "." ? ` to ${dest}` : ""}`,
      repo,
      dest
    });
    const directives = await this._getDirectives(dest);
    if (directives) {
      for (const d of directives) {
        await this.directiveActions[d.action](dir, dest, d);
      }
      if (this._hasStashed === true) {
        await unstashFiles(dir, dest);
      }
    }
  }
  /**
   * Removes files or directories from a specified destination
   * based on the provided action.
   *
   * @param _dir - The directory path.
   * @param dest - The destination path.
   * @param action - The action object containing the files to be removed.
   */
  async remove(_dir, dest, action) {
    let { files } = action;
    if (!Array.isArray(files)) {
      files = [files];
    }
    const removedFiles = [];
    for (const file of files) {
      const filePath = path2.resolve(dest, file);
      if (await pathExists(filePath)) {
        const isDir = await isDirectory(filePath);
        if (isDir) {
          await fs2.rm(filePath, { recursive: true, force: true });
          removedFiles.push(`${file}/`);
        } else {
          await fs2.unlink(filePath);
          removedFiles.push(file);
        }
      } else {
        this._warn({
          code: "FILE_DOES_NOT_EXIST",
          message: `action wants to remove ${bold(file)} but it does not exist`
        });
      }
    }
    if (removedFiles.length > 0) {
      this._info({
        code: "REMOVED",
        message: `removed: ${bold(removedFiles.map((d) => bold(d)).join(", "))}`
      });
    }
  }
  /**
   * Checks if a directory is empty.
   *
   * @param dir - The directory path to check.
   */
  async _checkDirIsEmpty(dir) {
    try {
      const files = await fs2.readdir(dir);
      if (files.length > 0) {
        if (this.force) {
          this._info({
            code: "DEST_NOT_EMPTY",
            message: `destination directory is not empty. Using options.force, continuing`
          });
          await fs2.rm(dir, { recursive: true, force: true });
        } else {
          throw new TigedError(
            `destination directory is not empty, aborting. Use options.force to override`,
            {
              code: "DEST_NOT_EMPTY"
            }
          );
        }
      } else {
        this._verbose({
          code: "DEST_IS_EMPTY",
          message: `destination directory is empty`
        });
      }
    } catch (err) {
      if (err instanceof TigedError && err.code !== "ENOENT") throw err;
    }
  }
  /**
   * Emits an `'info'` event with the provided information.
   *
   * @param info - The information to be emitted.
   */
  _info(info) {
    this.emit("info", info);
  }
  /**
   * Emits a `'warn'` event with the provided info.
   *
   * @param info - The information to be emitted.
   */
  _warn(info) {
    this.emit("warn", info);
  }
  /**
   * Logs the provided {@linkcode info} object
   * if the {@linkcode verbose} flag is set to `true`.
   *
   * @param info - The information to be logged.
   */
  _verbose(info) {
    if (this.verbose) this._info(info);
  }
  /**
   * Retrieves the hash for a given repository.
   *
   * @param repo - The repository object.
   * @param cached - The cached records.
   * @returns The hash value.
   */
  async _getHash(repo, cached) {
    try {
      const refs = await fetchRefs(repo);
      if (refs == null) {
        return;
      }
      if (repo.ref === "HEAD") {
        return refs?.find((ref) => ref.type === "HEAD")?.hash ?? "";
      }
      const selectedRef = this._selectRef(refs, repo.ref);
      if (selectedRef) {
        return selectedRef;
      }
      const isCommitHash = /^[0-9a-f]{40}$/.test(repo.ref);
      if (isCommitHash) {
        return repo.ref;
      }
      return;
    } catch (err) {
      if (err instanceof TigedError && "code" in err && "message" in err) {
        this._warn(err);
        if (err.original != null) {
          this._verbose(err.original);
        }
      }
      return;
    }
  }
  /**
   * Retrieves the commit hash from the cache for the given repository.
   *
   * @param repo - The repository object.
   * @param cached - The cached commit hashes.
   * @returns The commit hash if found in the cache; otherwise, `undefined`.
   */
  _getHashFromCache(repo, cached) {
    if (!(repo.ref in cached)) {
      return;
    }
    const hash = cached[repo.ref];
    this._info({
      code: "USING_CACHE",
      message: `using cached commit hash ${hash}`
    });
    return hash;
  }
  /**
   * Selects a commit hash from an array of references
   * based on a given selector.
   *
   * @param refs - An array of references containing type, name, and hash.
   * @param selector - The selector used to match the desired reference.
   * @returns The commit hash that matches the selector, or `null` if no match is found.
   */
  _selectRef(refs, selector) {
    for (const ref of refs) {
      if (ref.name === selector) {
        this._verbose({
          code: "FOUND_MATCH",
          message: `found matching commit hash: ${ref.hash}`
        });
        return ref.hash;
      }
    }
    if (selector.length < 8) return null;
    for (const ref of refs) {
      if (ref.hash.startsWith(selector)) return ref.hash;
    }
    return;
  }
  /**
   * Clones the repository specified by {@linkcode repo}
   * into the {@linkcode dest} directory using a tarball.
   *
   * @param dir - The directory where the repository is cloned.
   * @param dest - The destination directory where the repository will be extracted.
   * @throws A {@linkcode TigedError} If the commit hash for the repository reference cannot be found.
   * @throws A {@linkcode TigedError} If the tarball cannot be downloaded.
   * @returns A promise that resolves when the cloning and extraction process is complete.
   */
  async _cloneWithTar(dir, dest) {
    const { repo } = this;
    const cached = tryRequire(path2.join(dir, "map.json")) || {};
    const hash = this.offlineMode || this.cache ? this._getHashFromCache(repo, cached) : await this._getHash(repo, cached);
    const subdir = repo.subdir ? `${repo.name}-${hash}${repo.subdir}` : null;
    if (!hash) {
      throw new TigedError(`could not find commit hash for ${repo.ref}`, {
        code: "MISSING_REF",
        ref: repo.ref
      });
    }
    const file = `${dir}/${hash}.tar.gz`;
    const url = repo.site === "gitlab" ? `${repo.url}/-/archive/${hash}/${repo.name}-${hash}.tar.gz` : repo.site === "bitbucket" ? `${repo.url}/get/${hash}.tar.gz` : `${repo.url}/archive/${hash}.tar.gz`;
    try {
      if (!this.offlineMode || !this.cache) {
        try {
          if (this.noCache) {
            this._verbose({
              code: "NO_CACHE",
              message: `Not using cache. noCache set to true.`
            });
            throw "don't use cache";
          }
          await fs2.stat(file);
          this._verbose({
            code: "FILE_EXISTS",
            message: `${file} already exists locally`
          });
        } catch (err) {
          await fs2.mkdir(path2.dirname(file), { recursive: true });
          if (this.proxy) {
            this._verbose({
              code: "PROXY",
              message: `using proxy ${this.proxy}`
            });
          }
          this._verbose({
            code: "DOWNLOADING",
            message: `downloading ${url} to ${file}`
          });
          await fetch(url, file, this.proxy);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new TigedError(`could not download ${url}`, {
          code: "COULD_NOT_DOWNLOAD",
          url,
          original: err
        });
      }
    }
    if (!this.noCache) await updateCache(dir, repo, hash, cached);
    this._verbose({
      code: "EXTRACTING",
      message: `extracting ${subdir ? `${repo.subdir} from ` : ""}${file} to ${dest}`
    });
    await fs2.mkdir(dest, { recursive: true });
    const extractedFiles = untar(file, dest, subdir);
    if (extractedFiles.length === 0) {
      const noFilesErrorMessage = subdir ? "No files to extract. Make sure you typed in the subdirectory name correctly." : "No files to extract. The tar file seems to be empty";
      throw new TigedError(noFilesErrorMessage, {
        code: "NO_FILES"
      });
    }
    if (this.noCache) {
      await fs2.rm(file);
    }
  }
  /**
   * Clones the repository using Git.
   *
   * @param _dir - The source directory.
   * @param dest - The destination directory.
   */
  async _cloneWithGit(_dir, dest) {
    let gitPath = /https:\/\//.test(this.repo.src) ? this.repo.url : this.repo.ssh;
    gitPath = this.repo.site === "huggingface" ? this.repo.url : gitPath;
    const isWin = process.platform === "win32";
    if (this.repo.subdir) {
      await fs2.mkdir(path2.join(dest, ".tiged"), { recursive: true });
      const tempDir = path2.join(dest, ".tiged");
      if (isWin) {
        await exec2(
          `cd ${tempDir} && git init && git remote add origin ${gitPath} && git fetch --depth 1 origin ${this.repo.ref} && git checkout FETCH_HEAD`
        );
      } else if (this.repo.ref && this.repo.ref !== "HEAD" && !isWin) {
        await exec2(
          `cd ${tempDir}; git init; git remote add origin ${gitPath}; git fetch --depth 1 origin ${this.repo.ref}; git checkout FETCH_HEAD`
        );
      } else {
        await exec2(`git clone --depth 1 ${gitPath} ${tempDir}`);
      }
      const files = await fs2.readdir(`${tempDir}${this.repo.subdir}`, {
        recursive: true
      });
      await Promise.all(
        files.map(async (file) => {
          return fs2.rename(
            `${tempDir}${this.repo.subdir}/${file}`,
            `${dest}/${file}`
          );
        })
      );
      await fs2.rm(tempDir, { recursive: true, force: true });
    } else {
      if (isWin) {
        await fs2.mkdir(dest, { recursive: true });
        await exec2(
          `cd ${dest} && git init && git remote add origin ${gitPath} && git fetch --depth 1 origin ${this.repo.ref} && git checkout FETCH_HEAD`
        );
      } else if (this.repo.ref && this.repo.ref !== "HEAD" && !isWin) {
        await fs2.mkdir(dest, { recursive: true });
        await exec2(
          `cd ${dest}; git init; git remote add origin ${gitPath}; git fetch --depth 1 origin ${this.repo.ref}; git checkout FETCH_HEAD`
        );
      } else {
        await exec2(`git clone --depth 1 ${gitPath} ${dest}`);
      }
      await fs2.rm(path2.resolve(dest, ".git"), { recursive: true, force: true });
    }
  }
};
var supported = {
  github: ".com",
  gitlab: ".com",
  bitbucket: ".com",
  "git.sr.ht": ".ht",
  huggingface: ".co",
  codeberg: ".org"
};
function parse(src) {
  const match = /^(?:(?:https:\/\/)?([^:/]+\.[^:/]+)\/|git@([^:/]+)[:/]|([^/]+):)?([^/\s]+)\/([^/\s#]+)(?:((?:\/[^/\s#]+)+))?(?:\/)?(?:#(.+))?/.exec(
    src
  );
  if (!match) {
    throw new TigedError(`could not parse ${src}`, {
      code: "BAD_SRC",
      url: src
    });
  }
  const site = match[1] || match[2] || match[3] || "github.com";
  const tldMatch = /\.([a-z]{2,})$/.exec(site);
  const tld = tldMatch ? tldMatch[0] : null;
  const siteName = tld ? site.replace(new RegExp(`${tld}$`), "") : site;
  const user = match[4] ?? "";
  const name = match[5]?.replace(/\.git$/, "") ?? "";
  const subdir = match[6];
  const ref = match[7] || "HEAD";
  const domain = `${siteName}${tld || supported[siteName] || supported[site] || ""}`;
  const url = `https://${domain}/${user}/${name}`;
  const ssh = `git@${domain}:${user}/${name}`;
  const mode = siteName === "huggingface" ? "git" : supported[siteName] || supported[site] ? "tar" : "git";
  return { site: siteName, user, name, ref, url, ssh, subdir, mode, src };
}
function untar(file, dest, subdir = null) {
  const extractedFiles = [];
  (0, import_tar.extract)(
    {
      file,
      strip: subdir ? subdir.split("/").length : 1,
      C: dest,
      sync: true,
      onReadEntry: (entry) => {
        extractedFiles.push(entry.path);
      }
    },
    subdir ? [subdir] : []
  );
  return extractedFiles;
}
async function fetchRefs(repo) {
  try {
    const { stdout } = await exec2(`git ls-remote ${repo.url} ${repo.ref}`);
    return stdout.trim().split("\n").filter(Boolean).map((row) => {
      const [hash = "", ref = ""] = row.split("	");
      if (ref === "HEAD") {
        return {
          name: hash,
          type: ref,
          hash
        };
      }
      const match = /refs\/(\w+)\/(.+)/.exec(ref);
      if (!match)
        throw new TigedError(`could not parse ${ref}`, {
          code: "BAD_REF",
          ref,
          url: repo.url
        });
      const type = match[1] === "heads" ? "branch" : match[1] === "refs" ? "ref" : match[1] ?? "";
      const name = match[2] ?? "";
      return { type, name, hash };
    });
  } catch (error) {
    throw new TigedError(`could not fetch remote ${repo.url}`, {
      code: "COULD_NOT_FETCH",
      url: repo.url,
      original: error instanceof Error ? error : void 0,
      ref: repo.ref
    });
  }
}
async function updateCache(dir, repo, hash, cached) {
  const logs = tryRequire(path2.join(dir, "access.json")) || {};
  logs[repo.ref] = (/* @__PURE__ */ new Date()).toISOString();
  await fs2.writeFile(
    path2.join(dir, "access.json"),
    JSON.stringify(logs, null, "  ")
  );
  if (cached[repo.ref] === hash) return;
  const oldHash = cached[repo.ref];
  if (oldHash) {
    let used = false;
    for (const key in cached) {
      if (cached[key] === hash) {
        used = true;
        break;
      }
    }
    if (!used) {
      try {
        await fs2.unlink(path2.join(dir, `${oldHash}.tar.gz`));
      } catch (err) {
      }
    }
  }
  cached[repo.ref] = hash;
  await fs2.writeFile(
    path2.join(dir, "map.json"),
    JSON.stringify(cached, null, "  ")
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  tiged
});
//# sourceMappingURL=index.cjs.map