class DebugMessageLogger {
    logDebug(debugMessage){
        console.warn(`[ Debug ] ${debugMessage}`);
    }
}

export default new DebugMessageLogger();