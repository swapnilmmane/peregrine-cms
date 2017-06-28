/*-
 * #%L
 * admin base - UI Apps
 * %%
 * Copyright (C) 2017 headwire inc.
 * %%
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * #L%
 */
// var axios = require('axios')

import { LoggerFactory } from './logger'
let logger = LoggerFactory.logger('apiImpl').setLevelDebug()

import { stripNulls} from './utils'

const API_BASE = '/api'

let callbacks

function fetch(path) {

    logger.fine('fetch() ', path)
    return axios.get(API_BASE+path).then( (response) => {
        return new Promise( (resolve, reject) => {
            resolve(response.data)
        })
    }).catch( (error) => { logger.error('request to',
            error.response.request.path, 'failed')
            throw error
        })

}

function update(path) {

    logger.fine('update() ', path)
    return axios.post(API_BASE+path).then( (response) => {
        return new Promise( (resolve, reject) => {
            resolve(response.data)
        })
    }).catch( (error) => { logger.error('request to',
        error.response.request.path, 'failed')
        throw error
    })

}

function updateWithForm(path, data) {

    logger.debug('update() with data, path: ' + path + ', data: ' + data)
    return axios.post(API_BASE+path, data).then( (response) => {
            return new Promise( (resolve, reject) => {
                logger.debug('UpdateWithForm, response data: ' + response.data)
                resolve(response.data)
            })
        }).catch( (error) => {
                logger.error('request to',
                error.response.request.path, 'failed')
            throw error
        })
}

function updateWithFormAndConfig(path, data, config) {

    logger.debug('Upddate with Form and Config, path: ' + path + ', data: ' + data)
    return axios.post(API_BASE+path, data, config).then( (response) => {
            return new Promise( (resolve, reject) => {
                logger.debug('updateWithFormAndConfig, response data: ' + response.data)
                resolve(response.data)
            })
        }).catch( (error) => {
                logger.error('request to',
                error.response.request.path, 'failed')
            throw error
        })
}

function getOrCreate(obj, path) {

    if(path === '/') {
        // do nothing, requesting root
    }
    else {
        var segments = path.split('/').slice(1).reverse()

        while(segments.length > 0) {
            var segment = segments.pop()
            if(!obj[segment]) {
                Vue.set(obj, segment, {})
//                obj[segment] = {}
            }
            obj = obj[segment]
        }
    }

    return obj
}

function populateView(path, name, data) {

    return new Promise( (resolve, reject) => {
        var obj = getOrCreate(callbacks.getView(), path)
        let vue = callbacks.getApp()
        if(vue && path !== '/') {
            Vue.set(obj, name, data)
        } else {
            obj[name] = data
        }
        resolve()
    })

}


class PerAdminImpl {

    constructor(cb) {
        callbacks = cb
    }

    populateTools() {
        return new Promise( (resolve, reject) => {
            fetch('/admin/list.json/tools')
                .then( (data) => populateView('/admin', 'tools', data.children) )
                .then(() => resolve() )
                .catch( (error) => {
                    logger.error('call populateTools() failed')
                    reject(error)
                })
        })
    }

    populateToolsConfig() {
        return new Promise( (resolve, reject) => {
            fetch('/admin/list.json/tools/config')
                .then( (data) => populateView('/admin', 'toolsConfig', data.children) )
                .then(() => resolve() )
        })
    }

    populateUser() {
        return new Promise( (resolve, reject) => {
            fetch('/admin/access.json')
                .then( (data) => {
                    populateView('/state', 'user', data.userID)
                    if(data.userID === 'anonymous') {
                        alert('please login to continue')
                        window.location = '/'
                        reject()
                    }
                })
                .then(() => resolve() )
        })
    }

    populateContent(path) {
        return new Promise( (resolve, reject) => {
            fetch('/admin/content.json'+path)
                .then( (data) => populateView('/', 'adminPageStaged', data) )
                .then(() => resolve() )
        })
    }

    populateComponents() {
        return new Promise( (resolve, reject) => {
            fetch('/admin/components.json')
                .then( (data) => populateView('/admin', 'components', data) )
                .then( () => resolve() )
        })
    }

    populateObjects() {
        return new Promise( (resolve, reject) => {
            fetch('/admin/objects.json')
                .then( (data) => populateView('/admin', 'objects', data) )
                .then( () => resolve() )
        })
    }

    populateTemplates() {
        return new Promise( (resolve, reject) => {
            fetch('/admin/templates.json')
                .then( (data) => populateView('/admin', 'templates', data) )
                .then( () => resolve() )
        })
    }

    populateNodesForBrowser(path, target = 'nodes', includeParents = false) {
        return new Promise( (resolve, reject) => {
            fetch('/admin/nodes.json'+path+'?includeParents='+includeParents)
                .then( (data) => populateView('/admin', target, data ) )
                .then( () => resolve() )
        })
    }

    // populateComponentDefinition(component) {
    //     return new Promise( (resolve, reject) => {
    //         fetch('/admin/components/'+component)
    //             .then( (data) => populateView('/admin/componentDefinitions', component, data) )
    //             .then( () => resolve() )
    //     })
    // }

    populateComponentDefinitionFromNode(path) {
        return new Promise( (resolve, reject) => {
            var name;
            //AS TOOD: Check if we need to have a trailing slash on the api URI
            fetch('/admin/componentDefinition.json'+path)
                .then( (data) => {
                    name = data.name
                    let component = callbacks.getComponentByName(name)
                    if(component && component.methods && component.methods.augmentEditorSchema) {
                        data.model = component.methods.augmentEditorSchema(data.model)
                    }
                    populateView('/admin/componentDefinitions', data.name, data.model)
                    resolve(name)
                })
                .catch ( error => {
                    reject(error)
                } )
        })
    }

    populatePageView(path) {
        return new Promise( (resolve, reject) => {
            fetch('/admin/readNode.json'+path)
                .then( (data) => populateView('/pageView', 'page', data) )
                .then( () => resolve() )
        })
    }

    populateObject(path, target, name) {
        return new Promise( (resolve, reject) => {
            fetch('/admin/getObject.json'+path)
                .then( (data) => populateView(target, name, data).then( () => {
                    this.populateComponentDefinitionFromNode(path).then( () => {
                        resolve()
                    })
                } ) )

        })
    }


    createPage(parentPath, name, templatePath) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            data.append('name', name)
            data.append('templatePath', templatePath)
            updateWithForm('/admin/createPage.json/path'+parentPath, data)
                .then( (data) => this.populateNodesForBrowser(parentPath) )
                .then( () => resolve() )
        })
    }

    createObject(parentPath, name, templatePath) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            data.append('name', name)
            data.append('templatePath', templatePath)
            updateWithForm('/admin/createObject.json/path'+parentPath, data)
                .then( (data) => this.populateNodesForBrowser(parentPath) )
                .then( () => resolve() )
        })
    }

    deletePage(path) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            updateWithForm('/admin/deletePage.json'+path, data)
                .then( (data) => this.populateNodesForBrowser(path) )
                .then( () => resolve() )
        })
    }

    renamePage(path, newName) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            data.append('to', newName)
            updateWithForm('/admin/rename.json'+path, data)
                .then( (data) => this.populateNodesForBrowser(path) )
                .then( () => resolve() )
        })
    }

    movePage(path, to, type) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            data.append('to', to)
            data.append('type', type)
            updateWithForm('/admin/move.json'+path, data)
                .then( (data) => this.populateNodesForBrowser(path) )
                .then( () => resolve() )
        })
    }

    deletePageNode(path, nodePath) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            updateWithForm('/admin/deleteNode.json'+nodePath, data)
                .then( (data) => this.populatePageView(path) )
                .then( () => resolve() )
        })
    }

    createTemplate(parentPath, name) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            data.append(':name', name)
            updateWithForm('/admin/createTemplate.json'+parentPath, data)
                .then( (data) => this.populateNodesForBrowser(parentPath) )
                .then( () => resolve() )
        })
    }

    createFolder(parentPath, name) {
        return new Promise( (resolve, reject) => {
            let data = new FormData()
            data.append('name', name)
            upupdateWithFormdate('/admin/createFolder.json'+parentPath, data)
                .then( (data) => this.populateNodesForBrowser(parentPath) )
                .then( () => resolve() )
        })
    }

    uploadFiles(path, files, cb) {
        var config = {
          onUploadProgress: progressEvent => {
            var percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
            cb(percentCompleted)
          }
        }

        return new Promise( (resolve, reject) => {

            logger.fine('uploading files to', path)
            logger.fine(files)

            var data = new FormData()
            for(var i = 0; i < files.length; i++) {
                var file = files[i]
                data.append(file.name, file, file.name)
            }

            updateWithFormAndConfig('/admin/uploadFiles.json'+path, data, config)
                .then( (response) => this.populateNodesForBrowser(path) )
                .then( () => resolve() )
        })
    }

    fetchExternalImage(path, url, name) {
        return new Promise( (resolve, reject) => {
            axios.get(url, {responseType: "blob"}).then( (response) => {
                //alert(response.data)
                var data = new FormData()
                data.append(name, response.data, name)

                updateWithFormAndConfig('/admin/uploadFiles.json'+path, data)
                    .then( (response) => this.populateNodesForBrowser(path) )
                    .then( () => resolve() )
            })
        })
    }

    setInitialPageEditorState() {
        return new Promise( (resolve, reject) => {
            populateView('/state', 'editorVisible', false)
            populateView('/state', 'rightPanelVisible', true)
            resolve()
        })
    }

    savePageEdit(path, node) {
        return new Promise( (resolve, reject) => {

            // convert to a new object
            let nodeData = JSON.parse(JSON.stringify(node))

            let component = callbacks.getComponentByName(nodeData.component)
            if(component && component.methods && component.methods.beforeSave) {
                nodeData = component.methods.beforeSave(nodeData)
            }

            delete nodeData['children']
            delete nodeData['path']
            delete nodeData['component']
            nodeData['jcr:primaryType'] = 'nt:unstructured'
            nodeData['sling:resourceType'] = node.component.split('-').join('/')
            let data = new FormData();

            stripNulls(nodeData)

            // get the parent path and set the name of the node (due to problems with sling doing a
            // merge if not using this method to post - seems to have another issue, moves the node
            // to the end
            // let pathSegments = node.path.split('/')
            // let name = pathSegments.pop()
            // node.path = pathSegments.join('/')

            data.append(':operation', 'import')
            data.append(':contentType', 'json')
            data.append(':replace', 'true')
            data.append(':replaceProperties', 'true')
            data.append(':name', name)
            data.append(':content', JSON.stringify(nodeData))

            nodeData['sling:resourceType'] = node.component.split('-').join('/')

            axios.post(path + node.path, data).then( function(res) {
                resolve()
            })

        })
    }

    saveObjectEdit(path, node) {
        return new Promise( (resolve, reject) => {

            // convert to a new object
            let nodeData = JSON.parse(JSON.stringify(node))
            let data = new FormData();

            data.append(':operation', 'import')
            data.append(':contentType', 'json')
            data.append(':replaceProperties', 'true')
            data.append(':content', JSON.stringify(nodeData))

            axios.post(path, data).then( function(res) {
                resolve()
            })

        })
    }

    insertNodeAt(path, component, drop) {
        logger.fine(arguments)
        return new Promise( (resolve, reject) => {
            let data = new FormData();
            data.append('component', component)
            data.append('drop', drop)
            updateWithForm('/admin/insertNodeAt.json'+path, data)
                .then( function(data) {
                    resolve(data)
                })
        })
    }

    insertNodeWithDataAt(path, data, drop) {
        logger.fine(arguments)
        return new Promise( (resolve, reject) => {

            let postData = new FormData();

            postData.append('content', JSON.stringify(data))
            postData.append('drop', drop);

            updateWithForm('/admin/insertNodeAt.json'+path, postData)
                .then( (result) => {
                    resolve(result.data)
                })
        })
    }

    moveNodeTo(path, component, drop) {
        logger.debug('Move Node To: path: ' + path + ', component: ' + component + ', drop: ' + drop)
        return new Promise( (resolve, reject) => {
            let formData = new FormData();
            formData.append('component', component)
            formData.append('drop', drop)
            updateWithForm('/admin/moveNodeTo.json'+path, formData)
                .then( function(data) {
                    resolve(data)
                })
        })
    }
}

export default PerAdminImpl
