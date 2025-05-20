import { EventEmitter } from 'node:events';

/**
 * Represents the valid modes for a file.
 * The modes can be either `'tar'` or `'git'`.
 */
type ValidModes = 'tar' | 'git';
/**
 * Represents the options for a specific operation.
 */
interface Options {
    /**
     * Specifies whether to use caching.
     *
     * @default false
     */
    cache?: boolean;
    /**
     * Forces the operation to proceed, despite non-empty destination directory
     * potentially overwriting existing files.
     *
     * @default false
     */
    force?: boolean;
    /**
     * Specifies the mode for the operation.
     *
     * @default undefined
     */
    mode?: ValidModes;
    /**
     * Specifies whether to enable verbose logging.
     *
     * @default false
     */
    verbose?: boolean;
    /**
     * Specifies whether to enable offline mode.
     *
     * @default false
     */
    'offline-mode'?: boolean;
    /**
     * Specifies whether to enable offline mode.
     *
     * @default false
     */
    offlineMode?: boolean;
    /**
     * Specifies whether to disable caching.
     *
     * @default false
     */
    'disable-cache'?: boolean;
    /**
     * Specifies whether to disable caching.
     *
     * @default false
     */
    disableCache?: boolean;
    /**
     * Specifies whether to use subgrouping.
     *
     * @default false
     */
    subgroup?: boolean;
    /**
     * Specifies the sub-directory for the operation.
     *
     * @default undefined
     */
    'sub-directory'?: string;
}
/**
 * Represents information about a specific entity.
 */
interface Info {
    /**
     * The code associated with the entity.
     */
    readonly code?: string;
    /**
     * The message associated with the entity.
     */
    readonly message?: string;
    /**
     * The repository associated with the entity.
     */
    readonly repo?: Repo;
    /**
     * The destination of the entity.
     */
    readonly dest?: string;
}
/**
 * Represents an action.
 */
interface Action {
    /**
     * The type of action.
     */
    action: string;
    /**
     * The cache option.
     */
    cache?: boolean | undefined;
    /**
     * The verbose option.
     */
    verbose?: boolean | undefined;
}
/**
 * Represents a Tiged action for cloning.
 */
interface TigedAction extends Action {
    /**
     * The type of action, which is always `'clone'`.
     */
    action: 'clone';
    /**
     * The source path to clone from.
     */
    src: string;
}
/**
 * Represents a remove action.
 */
interface RemoveAction extends Action {
    /**
     * The type of action, which is always `'remove'`.
     */
    action: 'remove';
    /**
     * An array of file paths to be removed.
     */
    files: string[];
}
/**
 * Creates a new instance of the {@linkcode Tiged} class with
 * the specified source and options.
 *
 * @param src - The source path to clone from.
 * @param opts - The optional configuration options.
 * @returns A new instance of the {@linkcode Tiged} class.
 */
declare function tiged(src: string, opts?: Options): Tiged;
/**
 * The {@linkcode Tiged} class is an event emitter
 * that represents the Tiged tool.
 * It is designed for cloning repositories with specific options,
 * handling caching, proxy settings, and more.
 *
 * @extends EventEmitter
 */
declare class Tiged extends EventEmitter {
    src: string;
    /**
     * Enables offline mode, where operations rely on cached data.
     */
    offlineMode?: boolean;
    /**
     * Disables the use of cache for operations,
     * ensuring data is always fetched anew.
     */
    noCache?: boolean;
    /**
     * Enables caching of data for future operations.
     * @deprecated Will be removed in v3.X
     */
    cache?: boolean;
    /**
     * Forces the operation to proceed, despite non-empty destination directory
     * potentially overwriting existing files.
     */
    force?: boolean;
    /**
     * Enables verbose output for more detailed logging information.
     */
    verbose?: boolean;
    /**
     * Specifies the proxy server to be used for network requests.
     */
    proxy?: string;
    /**
     * Indicates if the repository is a subgroup, affecting repository parsing.
     */
    subgroup?: boolean;
    /**
     * Specifies a subdirectory within the repository to focus on.
     */
    subdir?: string;
    /**
     * Holds the parsed repository information.
     */
    repo: Repo;
    /**
     * Indicates the mode of operation,
     * which determines how the repository is cloned.
     * Valid modes are `'tar'` and `'git'`.
     */
    mode: ValidModes;
    /**
     * Flags whether stash operations have been performed to avoid duplication.
     */
    _hasStashed: boolean;
    /**
     * Defines actions for directives such as
     * cloning and removing files or directories.
     */
    directiveActions: {
        clone: (dir: string, dest: string, action: TigedAction) => Promise<void>;
        remove: (dir: string, dest: string, action: RemoveAction) => Promise<void>;
    };
    on: (event: 'info' | 'warn', callback: (info: Info) => void) => this;
    /**
     * Constructs a new {@linkcode Tiged} instance
     * with the specified source and options.
     *
     * @param src - The source repository string.
     * @param opts - Optional parameters to customize the behavior.
     */
    constructor(src: string, opts?: Options);
    /**
     * Retrieves the HTTPS proxy from the environment variables.
     *
     * @returns The HTTPS proxy value, or `undefined` if not found.
     */
    _getHttpsProxy(): string | undefined;
    /**
     * Retrieves the directives from the specified destination.
     *
     * @param dest - The destination path.
     * @returns An array of {@linkcode TigedAction} directives, or `false` if no directives are found.
     */
    _getDirectives(dest: string): Promise<false | TigedAction[]>;
    /**
     * Clones the repository to the specified destination.
     *
     * @param dest - The destination directory where the repository will be cloned.
     */
    clone(dest: string): Promise<void>;
    /**
     * Removes files or directories from a specified destination
     * based on the provided action.
     *
     * @param _dir - The directory path.
     * @param dest - The destination path.
     * @param action - The action object containing the files to be removed.
     */
    remove(_dir: string, dest: string, action: RemoveAction): Promise<void>;
    /**
     * Checks if a directory is empty.
     *
     * @param dir - The directory path to check.
     */
    _checkDirIsEmpty(dir: string): Promise<void>;
    /**
     * Emits an `'info'` event with the provided information.
     *
     * @param info - The information to be emitted.
     */
    _info(info: Info): void;
    /**
     * Emits a `'warn'` event with the provided info.
     *
     * @param info - The information to be emitted.
     */
    _warn(info: Info): void;
    /**
     * Logs the provided {@linkcode info} object
     * if the {@linkcode verbose} flag is set to `true`.
     *
     * @param info - The information to be logged.
     */
    _verbose(info: Info): void;
    /**
     * Retrieves the hash for a given repository.
     *
     * @param repo - The repository object.
     * @param cached - The cached records.
     * @returns The hash value.
     */
    _getHash(repo: Repo, cached: Record<string, string>): Promise<string | undefined>;
    /**
     * Retrieves the commit hash from the cache for the given repository.
     *
     * @param repo - The repository object.
     * @param cached - The cached commit hashes.
     * @returns The commit hash if found in the cache; otherwise, `undefined`.
     */
    _getHashFromCache(repo: Repo, cached: Record<string, string>): string | undefined;
    /**
     * Selects a commit hash from an array of references
     * based on a given selector.
     *
     * @param refs - An array of references containing type, name, and hash.
     * @param selector - The selector used to match the desired reference.
     * @returns The commit hash that matches the selector, or `null` if no match is found.
     */
    _selectRef(refs: {
        type: string;
        name?: string;
        hash: string;
    }[], selector: string): string | null | undefined;
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
    _cloneWithTar(dir: string, dest: string): Promise<void>;
    /**
     * Clones the repository using Git.
     *
     * @param _dir - The source directory.
     * @param dest - The destination directory.
     */
    _cloneWithGit(_dir: string, dest: string): Promise<void>;
}
/**
 * Represents a repository.
 */
interface Repo {
    /**
     * The hosting service or site for the repository.
     */
    site: string;
    /**
     * The username or organization under which the repository is located.
     */
    user: string;
    /**
     * The name of the repository.
     */
    name: string;
    /**
     * The reference to a specific branch, commit, or tag in the repository.
     */
    ref: string;
    /**
     * The URL to access the repository via HTTP or HTTPS.
     */
    url: string;
    /**
     * The SSH URL to access the repository for Git operations.
     */
    ssh: string;
    /**
     * Optional. A specific subdirectory within the repository to work with,
     * if applicable. Can be `null` if not used.
     */
    subdir?: string | null;
    /**
     * The mode of operation or interaction with the repository.
     * Valid modes are `'tar'` and `'git'`.
     */
    mode: ValidModes;
    /**
     * The source URL or path for cloning the repository.
     */
    src: string;
    /**
     * Optional. Indicates whether the repository belongs to a subgroup,
     * if supported by the hosting service.
     */
    subgroup?: boolean;
}

export { type Options, type Repo, tiged };
