class DebugMessageLogger {
    logDebug(debugMessage){
        console.warn(`[ Debug ] ${debugMessage} should be defined`);
    }
}

export default new DebugMessageLogger();