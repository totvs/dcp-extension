import * as fs from 'fs-extra';
import * as vscode from 'vscode';

export async function configure(
    folderPath?: string,
    include?: boolean,
    settings?: boolean,
    docker?: boolean,
    context?: vscode.ExtensionContext): Promise<void> {

    if (!folderPath) {
        let folder: vscode.WorkspaceFolder;
        folder = vscode.workspace.workspaceFolders[0];

        if (!folder) {
            if (!vscode.workspace.workspaceFolders) {
                throw new Error('Files can only be generated if VS Code is opened on a folder.');
            } else {
                throw new Error('Files can only be generated if a workspace folder is picked in VS Code.');
            }
        }

        folderPath = folder.uri.fsPath;
    }
    if (folderPath) {
        createWorkspaceFileIfNotExists(folderPath, include, settings, docker, context);
    }

}

function createWorkspaceFileIfNotExists(
    folderPath, include?: boolean,
    settings?: boolean,
    docker?: boolean,
    context?: vscode.ExtensionContext) {

        if ( include ) {
            createIncludes(folderPath, context);
        }

        if ( settings ) {
            createSettings(folderPath, context);
        }

        if ( docker ) {
            createDocker(folderPath, context);
        }

}

function createDocker(folderPath, context?: vscode.ExtensionContext) {

    const assets = context.extensionPath + '/src/assets/protheus-dev-sandbox.yml';
    copy('file', assets, folderPath + '/protheus-dev-sandbox.yml');

}

function createIncludes(folderPath, context?: vscode.ExtensionContext) {
    const assets = context.extensionPath + '/src/assets/includes';
    copy('folder', assets, folderPath + '/includes');

}

function createSettings(folderPath, context?: vscode.ExtensionContext) {
    const path = require('path');
	
    const settings = path.join(context.extensionPath, 'src', 'assets', 'vscode');
    copy('folder', settings, path.join(folderPath, '.vscode'));

}
						
function createSmartClient(folderPath, context?: vscode.ExtensionContext) {
    const path = require('path');
	
    const settings = path.join(context.extensionPath, 'src', 'assets', 'smartclient');
    copy('folder', settings, path.join(folderPath, 'SmartClient'));

}
						
						
function copy(type, src, dest ) {
    if (type === 'folder') {
        fs.copy(src, dest);
    } else {
        fs.copyFile(src, dest, err => {});
    }
}
