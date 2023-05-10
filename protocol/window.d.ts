declare module window {
    /**
     * Show an information message to users. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an information message to users. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage(message: string, options: MessageOptions, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an information message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show an information message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show a warning message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage(message: string, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show a warning message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage(message: string, options: MessageOptions, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show a warning message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show a warning message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show an error message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an error message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage(message: string, options: MessageOptions, ...items: string[]): Thenable<string | undefined>;

    /**
     * Show an error message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;

    /**
     * Show an error message.
     *
     * @see {@link window.showInformationMessage showInformationMessage}
     *
     * @param message The message to show.
     * @param options Configures the behaviour of the message.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;

    /**
     * Shows a selection list allowing multiple selections.
     *
     * @param items An array of strings, or a promise that resolves to an array of strings.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selected items or `undefined`.
     */
    export function showQuickPick(items: readonly string[] | Thenable<readonly string[]>, options: QuickPickOptions & { canPickMany: true; }, token?: CancellationToken): Thenable<string[] | undefined>;

    /**
     * Shows a selection list.
     *
     * @param items An array of strings, or a promise that resolves to an array of strings.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selection or `undefined`.
     */
    export function showQuickPick(items: readonly string[] | Thenable<readonly string[]>, options?: QuickPickOptions, token?: CancellationToken): Thenable<string | undefined>;

    /**
     * Shows a selection list allowing multiple selections.
     *
     * @param items An array of items, or a promise that resolves to an array of items.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selected items or `undefined`.
     */
    export function showQuickPick<T extends QuickPickItem>(items: readonly T[] | Thenable<readonly T[]>, options: QuickPickOptions & { canPickMany: true; }, token?: CancellationToken): Thenable<T[] | undefined>;

    /**
     * Shows a selection list.
     *
     * @param items An array of items, or a promise that resolves to an array of items.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selected item or `undefined`.
     */
    export function showQuickPick<T extends QuickPickItem>(items: readonly T[] | Thenable<readonly T[]>, options?: QuickPickOptions, token?: CancellationToken): Thenable<T | undefined>;

    /**
     * Shows a selection list of {@link workspace.workspaceFolders workspace folders} to pick from.
     * Returns `undefined` if no folder is open.
     *
     * @param options Configures the behavior of the workspace folder list.
     * @return A promise that resolves to the workspace folder or `undefined`.
     */
    export function showWorkspaceFolderPick(options?: WorkspaceFolderPickOptions): Thenable<WorkspaceFolder | undefined>;

    /**
     * Shows a file open dialog to the user which allows to select a file
     * for opening-purposes.
     *
     * @param options Options that control the dialog.
     * @returns A promise that resolves to the selected resources or `undefined`.
     */
    export function showOpenDialog(options?: OpenDialogOptions): Thenable<Uri[] | undefined>;

    /**
     * Shows a file save dialog to the user which allows to select a file
     * for saving-purposes.
     *
     * @param options Options that control the dialog.
     * @returns A promise that resolves to the selected resource or `undefined`.
     */
    export function showSaveDialog(options?: SaveDialogOptions): Thenable<Uri | undefined>;

    /**
     * Opens an input box to ask the user for input.
     *
     * The returned value will be `undefined` if the input box was canceled (e.g. pressing ESC). Otherwise the
     * returned value will be the string typed by the user or an empty string if the user did not type
     * anything but dismissed the input box with OK.
     *
     * @param options Configures the behavior of the input box.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to a string the user provided or to `undefined` in case of dismissal.
     */
    export function showInputBox(options?: InputBoxOptions, token?: CancellationToken): Thenable<string | undefined>;

    /**
     * Creates a {@link QuickPick} to let the user pick an item from a list
     * of items of type T.
     *
     * Note that in many cases the more convenient {@link window.showQuickPick}
     * is easier to use. {@link window.createQuickPick} should be used
     * when {@link window.showQuickPick} does not offer the required flexibility.
     *
     * @return A new {@link QuickPick}.
     */
    export function createQuickPick<T extends QuickPickItem>(): QuickPick<T>;

    /**
     * Creates a {@link InputBox} to let the user enter some text input.
     *
     * Note that in many cases the more convenient {@link window.showInputBox}
     * is easier to use. {@link window.createInputBox} should be used
     * when {@link window.showInputBox} does not offer the required flexibility.
     *
     * @return A new {@link InputBox}.
     */
    export function createInputBox(): InputBox;

    /**
     * Creates a new {@link OutputChannel output channel} with the given name.
     *
     * @param name Human-readable string which will be used to represent the channel in the UI.
     */
    export function createOutputChannel(name: string): OutputChannel;

    /**
     * Create and show a new webview panel.
     *
     * @param viewType Identifies the type of the webview panel.
     * @param title Title of the panel.
     * @param showOptions Where to show the webview in the editor. If preserveFocus is set, the new webview will not take focus.
     * @param options Settings for the new panel.
     *
     * @return New webview panel.
     */
    export function createWebviewPanel(viewType: string, title: string, showOptions: ViewColumn | { viewColumn: ViewColumn, preserveFocus?: boolean }, options?: WebviewPanelOptions & WebviewOptions): WebviewPanel;

    /**
     * Set a message to the status bar. This is a short hand for the more powerful
     * status bar {@link window.createStatusBarItem items}.
     *
     * @param text The message to show, supports icon substitution as in status bar {@link StatusBarItem.text items}.
     * @param hideAfterTimeout Timeout in milliseconds after which the message will be disposed.
     * @return A disposable which hides the status bar message.
     */
    export function setStatusBarMessage(text: string, hideAfterTimeout: number): Disposable;

    /**
     * Set a message to the status bar. This is a short hand for the more powerful
     * status bar {@link window.createStatusBarItem items}.
     *
     * @param text The message to show, supports icon substitution as in status bar {@link StatusBarItem.text items}.
     * @param hideWhenDone Thenable on which completion (resolve or reject) the message will be disposed.
     * @return A disposable which hides the status bar message.
     */
    export function setStatusBarMessage(text: string, hideWhenDone: Thenable<any>): Disposable;

    /**
     * Set a message to the status bar. This is a short hand for the more powerful
     * status bar {@link window.createStatusBarItem items}.
     *
     * *Note* that status bar messages stack and that they must be disposed when no
     * longer used.
     *
     * @param text The message to show, supports icon substitution as in status bar {@link StatusBarItem.text items}.
     * @return A disposable which hides the status bar message.
     */
    export function setStatusBarMessage(text: string): Disposable;

    /**
     * Show progress in the Source Control viewlet while running the given callback and while
     * its returned promise isn't resolve or rejected.
     *
     * @deprecated Use `withProgress` instead.
     *
     * @param task A callback returning a promise. Progress increments can be reported with
     * the provided {@link Progress}-object.
     * @return The thenable the task did return.
     */
    export function withScmProgress<R>(task: (progress: Progress<number>) => Thenable<R>): Thenable<R>;

    /**
     * Show progress in the editor. Progress is shown while running the given callback
     * and while the promise it returned isn't resolved nor rejected. The location at which
     * progress should show (and other details) is defined via the passed {@linkcode ProgressOptions}.
     *
     * @param task A callback returning a promise. Progress state can be reported with
     * the provided {@link Progress}-object.
     *
     * To report discrete progress, use `increment` to indicate how much work has been completed. Each call with
     * a `increment` value will be summed up and reflected as overall progress until 100% is reached (a value of
     * e.g. `10` accounts for `10%` of work done).
     * Note that currently only `ProgressLocation.Notification` is capable of showing discrete progress.
     *
     * To monitor if the operation has been cancelled by the user, use the provided {@linkcode CancellationToken}.
     * Note that currently only `ProgressLocation.Notification` is supporting to show a cancel button to cancel the
     * long running operation.
     *
     * @return The thenable the task-callback returned.
     */
    export function withProgress<R>(options: ProgressOptions, task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Thenable<R>): Thenable<R>;

    /**
     * Creates a {@link Terminal} with a backing shell process. The cwd of the terminal will be the workspace
     * directory if it exists.
     *
     * @param name Optional human-readable string which will be used to represent the terminal in the UI.
     * @param shellPath Optional path to a custom shell executable to be used in the terminal.
     * @param shellArgs Optional args for the custom shell executable. A string can be used on Windows only which
     * allows specifying shell args in
     * [command-line format](https://msdn.microsoft.com/en-au/08dfcab2-eb6e-49a4-80eb-87d4076c98c6).
     * @return A new Terminal.
     * @throws When running in an environment where a new process cannot be started.
     */
    export function createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): Terminal;

    /**
     * Creates a {@link Terminal} with a backing shell process.
     *
     * @param options A TerminalOptions object describing the characteristics of the new terminal.
     * @return A new Terminal.
     * @throws When running in an environment where a new process cannot be started.
     */
    export function createTerminal(options: TerminalOptions): Terminal;

    /**
     * Creates a {@link Terminal} where an extension controls its input and output.
     *
     * @param options An {@link ExtensionTerminalOptions} object describing
     * the characteristics of the new terminal.
     * @return A new Terminal.
     */
    export function createTerminal(options: ExtensionTerminalOptions): Terminal;
}