const Methods = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
const response = await fetch(import.meta.env.BASE_URL + './openapi.json');
const openapi = await response.json();

export function getCommandDocs(codeText){
    if(codeText.slice(0,2) == '//'){
        return null;
    }
    const command = codeText.split(/\r?\n/).shift();
    const [method, endpoint] = command.split(" ");
    if (method && endpoint){
        if (!Methods.includes(method)){
            return null
        }
        return matchCommand(method, endpoint);
    }
    else{
        return null
    }
}

function matchCommand(method,endpoint){
    const paths = Object.keys(openapi.paths);
    for (const path of paths){
        const matchReg = new RegExp('^/?' + path.slice(1,).replace(/{.*?}/g, '[-a-zA-Z0-9_<>]+') + '$');
        if(matchReg.test(endpoint)){
            if (method.toLowerCase() in openapi.paths[path]){
                return openapi.paths[path][method.toLowerCase()];
            }
        }
    }
    return null
}