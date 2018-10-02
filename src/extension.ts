'use strict';

import * as vscode from 'vscode';

import { configure } from './configure';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(checkWorkspace(context));
    context.subscriptions.push(createSettings(context));

}

function checkWorkspace(context) {

    const options = ['Current', 'New Directory'];

    return vscode.commands.registerCommand('thf.checkWorkspace',  async () => {

        vscode.window.showQuickPick( options, { placeHolder: 'Project Directory:'} ).then( resultPath => {

            if ( resultPath ) {

                if ( resultPath === 'New Directory' ) {
                    vscode.window.showOpenDialog({ canSelectFolders: true }).then(resultInput => {
                        newDirectory(resultInput, context);
                    });
                } else {

                    vscode.window.showWorkspaceFolderPick( { placeHolder: 'Select your workspace:'} ).then( result => {
                        createCompose( result.uri.fsPath, context );
                    });

                }

            }

        });

    });
}

function newDirectory(resultInput, context) {

    const name = resultInput['0'].path.substr(resultInput['0'].path.lastIndexOf('/') + 1, resultInput['0'].path.length);
    let workspace;

    workspace = {
        name,
        uri: resultInput['0']
    };

    if ( vscode.workspace.updateWorkspaceFolders (
        vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, null, workspace )) {
        createCompose(resultInput['0'].fsPath, context);
    }

}

function createCompose(path, context?: vscode.ExtensionContext) {

    const YES_OR_NO_PROMPT: Array<vscode.MessageItem> = [
        {
            title: 'Yes',
            isCloseAffordance: false
        },
        {
            title: 'No',
            isCloseAffordance: true
        }
    ];

    vscode.window.showInformationMessage('Do you want to import Protheus Includes?', ...YES_OR_NO_PROMPT).then(result => {

        if (result.title === 'Yes') {
            configure(path, true, false, true, context);
        } else {
            configure(path, false, false, true, context);
        }

        vscode.window.showInformationMessage('Development Environment Created Successfully!');
    });

}

function createSettings(context?: vscode.ExtensionContext) {

    return vscode.commands.registerCommand('thf.createSettings',  async () => {

        const advplExt = vscode.extensions.getExtension('KillerAll.advpl-vscode');

        if (advplExt) {
            vscode.window.showWorkspaceFolderPick({ placeHolder: 'Select your workspace:'}).then(result => {

                configure(result.uri.fsPath, false, true, false, context);

                setTimeout(() => {

                if (result) {

                    const uri = vscode.Uri.file(result.uri.fsPath );
                    const folderConf = vscode.workspace.getConfiguration('advpl', uri );
                    const env = folderConf.get('environments');

                    env['0'].includeList = result.uri.path + '/includes';

                    folderConf.update('pathPatchBuild', result.uri.path + '/patchBuild', vscode.ConfigurationTarget.WorkspaceFolder);
                    folderConf.update('environments', env, vscode.ConfigurationTarget.WorkspaceFolder);

                }
                }, 2000);

                vscode.window.showInformationMessage('Your ADVPL settings have been successfully updated!');

            });

        } else {
            vscode.window.showErrorMessage('ADVPL Extension is not installed');
        }

    });
}
