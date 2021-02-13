const modules = {};
const requireModule = require.context('./delayedAction', false, /.ts$/)

requireModule.keys().forEach(fileName => {
	if (fileName === "./handler.ts") return; //reject the handler.ts file
	const moduleConfig = requireModule(fileName)
	const moduleName = fileName.replace(/(\.\/|\.ts)/g, "");
	modules[moduleName] = moduleConfig.default
})
export const backendFuncHandler = modules