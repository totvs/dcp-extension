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

    copy('settings', settings, path.join(folderPath, '.vscode'));
}

function copy(type, src, dest) {
    if (type === 'settings') {
        createJson(src);
        fs.copy(src, dest);
    }

    if (type === 'folder') {
        fs.copy(src, dest);
    }

    if (type === 'file') {
        fs.copyFile(src, dest, err => { });
    }
}

function createJson(src) {
    const path = require('path');
    const arrayJson = [];

    arrayJson.push({'docker.dockerComposeBuild': false,
                    'docker.dockerComposeDetached' : false,
                    'files.encoding' : 'windows1252',
                    'advpl.debug_multiThread' : true,
                    'advpl.debug_ignoreSourceNotFound' : true,
                    'advpl.debug_showTables' : true,
                    'advpl.debug_showPrivates' : true,
                    'advpl.debug_showPublic' : true,
                    'advpl.debug_showStatics' : true,
                    'advpl.alpha_compile' : true,
                    'advpl.pathPatchBuild' : '',
                    'advpl.environments': [{ 'server' : 'localhost',
                    'port' : '8081',
                    'compile_force_recompile' : true,
                    'smartClientPath' :  path.join(src, 'smartclient'),
                    'environment' : 'environment',
                    'includeList' : path.join(src, 'includes'),
                    'startProgram' : 'SIGACFG',
                    'user' : 'admin',
                    'passwordCipher' : '',
                    }],
                    'advpl.selectedEnvironment' : 'environment',
                    'advpl.logger' : true});

    fs.writeFileSync(path.join(src, 'settings.json'), JSON.stringify(arrayJson, null, '\t'), 'utf8');
}
