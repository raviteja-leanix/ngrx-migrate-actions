"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateActions = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const utils_1 = require("./utils");
const lodash = require("lodash");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.

function migrateNgrx(_options) {
    return (tree, _context) => {
        const { filePath, usedIn, importedAs } = _options;
        if (!filePath) {
            throw new schematics_1.SchematicsException(`filePath option is required.`);
        }
        if (!tree.exists(filePath)) {
            throw new schematics_1.SchematicsException(`filePath does not exist.`);
        }
        const usedInFiles = usedIn.split(',');
        var usedInFilesContent = {}
        for(var i in usedInFiles){
            const content1 = tree.read(usedInFiles[i])

            const strContent1 = content1.toString();
            usedInFilesContent[usedInFiles[i]] = strContent1;
        }

        var updatedContent = null;

        if(!tree.exists(filePath) && tree.getDir(filePath).subfiles.length > 0) {
            tree.getDir(filePath)
            .visit(fileName => {
            if (!fileName.endsWith('reducer.ts')) {
                return;
            }
            const content = tree.read(fileName);
            if (!content) {
                return;
            }
            let strContent = '';
            if (content)
                strContent = content.toString();
            updatedContent = process1(strContent, usedInFilesContent, importedAs);
            if (updatedContent.file) {
                console.log('Updated action Content:', updatedContent.file);
                tree.overwrite(fileName, updatedContent.file);
            }

            });
        } else {
            const content = tree.read(filePath);
            if (!content) {
                return;
            }
            let strContent = '';
            if (content)
                strContent = content.toString();
            updatedContent = process1(strContent, usedInFilesContent, importedAs);
            if (updatedContent) {
                console.log('Updated action Content:', updatedContent.file);
                tree.overwrite(filePath, updatedContent.file);
            }
        }
        for (const [key, value] of Object.entries(updatedContent.imports)) {
            if(value){
                const xyz = typeof value;
                xyz === 'object';
                tree.overwrite(key, value.toString().trim("\""));
            }
          }
        return tree;
    };
}

function migrateActions(_options) {
    return (tree, _context) => {
        const { filePath } = _options;
        if (!filePath) {
            throw new schematics_1.SchematicsException(`filePath option is required.`);
        }

        if(!tree.exists(filePath) && tree.getDir(filePath).subfiles.length > 0) {
            tree.getDir(filePath)
            .visit(fileName => {
            if (!fileName.endsWith('reducer.ts')) {
                return;
            }
            const content = tree.read(fileName);
            if (!content) {
                return;
            }
            let strContent = '';
            if (content)
                strContent = content.toString();
            const updatedContent = process(strContent);
            if (updatedContent) {
                console.log('Updated action Content:', updatedContent);
                tree.overwrite(fileName, updatedContent);
            }
        });
        } else {
            const content = tree.read(filePath);
            if (!content) {
                return;
            }
            let strContent = '';
            if (content)
                strContent = content.toString();
            const updatedContent = process(strContent);
            if (updatedContent) {
                console.log('Updated action Content:', updatedContent);
                tree.overwrite(filePath, updatedContent);
            }
        }
        return tree;
    };
}
exports.migrateActions = migrateActions;
exports.migrateNgrx = migrateNgrx;
function process(content) {
    const re = /(export(\ )+class)/gi;
    const actionList = [];
    let match;
    let output = utils_1.Util.removeMultilineComment(content);
    output = utils_1.Util.removeInlineComment(content);
    while ((match = re.exec(output)) != null) {
        const initPos = match.index - 1;
        const endPos = findClassEndPos(output, initPos);
        if (endPos === 0) {
            continue;
        }
        const str = output.substring(initPos, initPos + endPos);
        const action = getActionName(str);
        const actionVariableName = getActionVariableName(str);
        const actionVariableValue = getActionVariableValue(output, actionVariableName);

        let attributes = getAttributes(str);
        console.log({action,attributes})
        if (action) {
            actionList.push(action);
            const template = `
            export const ${lodash.camelCase(actionVariableName)} = createAction(
                '${actionVariableValue}',
                ${areValidAttributes(attributes) ? `props<${attributes.substr(attributes.indexOf('{'), attributes.indexOf('}'))}>(),` : ''}
            );`;
            output = output.substr(0, initPos) + template + output.substr(initPos + endPos);
        }
        else {
            console.error('couldn\'t parse');
        }
    }
    output = addImports(output, [ 'createAction','props']);
    return output;
}

function process1(content, usedInFilesContent, importedAs) {
    const re = /(export(\ )+class)/gi;
    const actionList = [];
    let match;
    let output = utils_1.Util.removeMultilineComment(content);
    output = utils_1.Util.removeInlineComment(content);
    while ((match = re.exec(output)) != null) {
        const initPos = match.index - 1;
        const endPos = findClassEndPos(output, initPos);
        if (endPos === 0) {
            continue;
        }
        const str = output.substring(initPos, initPos + endPos);
        const action = getActionName(str);
        const actionVariableName = getActionVariableName(str);
        const actionVariableValue = getActionVariableValue(output, actionVariableName);




        usedInFilesContent = Object.entries(usedInFilesContent).reduce(function (acc, [key, value]){

            var importedAsRegExp = `(?<=import \\\* as )(.*)(?= from '${importedAs.replace(/\//g, '\\/')}';)`
            var re2 = new RegExp(importedAsRegExp, "g");
            const importedAsName =  re2.exec(value);
            if(importedAsName && importedAsName != ''){
                const importedAsName1 = importedAsName[0];

                var searchFor3 = `new ${importedAsName1}.${action}`;
                var re3 = new RegExp(searchFor3, "g");

                var searchFor4 = `${importedAsName1}.${action}`;
                var re4 = new RegExp(searchFor4, "g");

                var searchFor5 = `${importedAsName1}.${actionVariableName}`;
                var re5 = new RegExp(searchFor5, "g");
            }
                var searchFor1 = `new ${action}`;
                var re1 = new RegExp(searchFor1,"g");
                // var importedAsRegExp1 = `(?<=import \{)([\s\S.]*)(?=\} from '${importedAs.replace(/\//g, '\\/')}';)`
                // var re7 = new RegExp(importedAsRegExp1, "g");
                // const getAllImports =  re7.exec(value);
                // if(getAllImports && getAllImports[0].split(',').includes(actionVariableName)){
                    var searchFor6 = `${actionVariableName}`;
                    var re6 = new RegExp(searchFor6, "g");
                // }

                var searchFor8 = `${action}`;
                var re8 = new RegExp(searchFor8,"g");


            var newValue = value.replace(re1, lodash.camelCase(actionVariableName));
            if(re3){
                const combinedNameMatch = re3.exec(newValue);
                if(combinedNameMatch){
                    newValue = newValue.replace(re3, `${importedAsName[0]}.${lodash.camelCase(actionVariableName)}`);
                }
            }
            if(re4){
                const combinedNameMatch = re4.exec(newValue);
                if(combinedNameMatch){
                    newValue = newValue.replace(re4, `${importedAsName[0]}.${lodash.camelCase(actionVariableName)}`);
                }
            }
            if(re5){
                const combinedNameMatch = re5.exec(newValue);
                if(combinedNameMatch){
                    newValue = newValue.replace(re5, `${importedAsName[0]}.${lodash.camelCase(actionVariableName)}`);
                }
            }
            if(re6){
                const combinedNameMatch = re6.exec(newValue);
                if(combinedNameMatch){
                    newValue = newValue.replace(re6, `${lodash.camelCase(actionVariableName)}`);
                }
            }
            if(re8){
                const combinedNameMatch = re8.exec(newValue);
                if(combinedNameMatch){
                    newValue = newValue.replace(re8, `${lodash.camelCase(actionVariableName)}`);
                }
            }

            return {...acc, [key]: newValue !== '' ? newValue: value}
        }, {})

        let attributes = getAttributes(str);
        console.log({action,attributes})
        if (action) {
            actionList.push(action);
            const template = `
            export const ${lodash.camelCase(actionVariableName)} = createAction(
                '${actionVariableValue}',
                ${areValidAttributes(attributes) ? `props<${attributes.substr(attributes.indexOf('{'), attributes.indexOf('}'))}>(),` : ''}
            );`;
            output = output.substr(0, initPos) + template + output.substr(initPos + endPos);
        }
        else {
            console.error('couldn\'t parse');
        }
    }
    output = addImports(output, [ 'createAction','props']);
    return  { file: output, imports: usedInFilesContent};
}
function areValidAttributes(attributes) {
    const notValidAttributes = ['payload?: void','payload: void'];
    return attributes && !notValidAttributes.includes(attributes);
}

function checkIfImportPresent(str, imp){
    const importCheckRegex = new RegExp(`import {?[\\s\\w,]*${imp}[\\s\\w,]*}? from '[\\w\\-_/.@]+';`, 'gm');
    var src = str.matchAll(importCheckRegex);
    var matches = Array.from(src, x => x);
    return matches.filter(imp => imp!=null);
}

String.prototype.replaceBetween = function(start,end,str){
    return this.substring(0,start) + str + this.substring(end);
}

function getActionVariableValue(str, variableName){
    const regex = new RegExp(`(?<=(export const ${variableName} = '))[\\s\\w\\[\\]]*(?=(';))`,'gm');
    var src = str.matchAll(regex);
    var matches = Array.from(src, x => {
        return x[0];
    });
    if (matches.length > 0) {
        return matches[0];
    }
    return null;
}

function addImportString(str, impString, start = -1, end = -1) {
    if(start===-1 && end===-1) {
        return impString + '\n' + str;
    }
    return str.replaceBetween(start, end, impString)
}

function generateImportString(currentImportString, imp){
    const importList = currentImportString!==''
                        ? currentImportString
                            .substring(currentImportString.indexOf('{')+1,currentImportString.indexOf('}'))
                            .split(',')
                            .map(i => i.trim())
                        : [];
    if(!importList.includes(imp)) importList.push(imp);
    return `import { ${importList.join(', ') } } from '@ngrx/store';`;
}

function addImports(str, listOfImports){
    listOfImports.forEach(imp => {
        const matchedImports = checkIfImportPresent(str,imp);
        if(matchedImports.length) return;
        const prevNgrxImportString = isPreviousNgrxImportPresent(str);

        const importString = generateImportString(prevNgrxImportString && prevNgrxImportString.length && prevNgrxImportString[0] ? prevNgrxImportString[0] :  '', imp);
        if(isPreviousNgrxImportPresent(str)){
            const start = prevNgrxImportString.index;
            const end = prevNgrxImportString.index + prevNgrxImportString[0].length;
            str = addImportString(str, importString,start,end);
        }else{
            str = addImportString(str, importString);
        }
    })
    return str;
}

function findClassEndPos(str, pos) {
    var content = str.substring(pos);
    var re = /[{}]/g;
    var counter = 0;
    let match;
    while ((match = re.exec(content)) != null) {
        if (content[match.index] == '{') {
            counter++;
        }
        else {
            counter--;
        }
        if (counter < 0) {
            console.error('found incorrect paranthesis');
            break;
        }
        else if (counter == 0) {
            return match.index + 1;
        }
    }
    return 0;
}

function isPreviousNgrxImportPresent(str){
    var src = str.matchAll(/import {[\s\w,]+} from '@ngrx\/store';/gm);
    var matches = Array.from(src, x => x);
    if (matches.length > 0) {
        return matches[0];
    }
    return null;
}

function getActionName(str) {
    var src = str.matchAll(/export[\ ]+class[\ ]+([A-Za-z]*?)[\ ]/g);
    var matches = Array.from(src, x => {
        return x[1];
    });

    if (matches.length > 0) {
        return matches[0];
    }
    return null;
}

function getActionVariableName(str){
    var src = str.matchAll(/(?<=(readonly type = ))\w+/g);
    var matches = Array.from(src, x => x[0]);
    if (matches.length > 0) {
        return matches[0];
    }
    return null;
}

function getAttributes(str) {
    var src = str.matchAll(/(?<=constructor[\s\S]*\()([\s\S]*?)(?=\))/gm);
    var matches = Array.from(src, x => x[1]);
    if (matches.length > 0) {
        return matches[0].replace(/public /g, '');
    }
    return '';
}
//# sourceMappingURL=index.js.map
