import { ConsoleDomainLogger } from "../src/ports"

describe("Test ConsoleDomainLogger", () => {
  let consoleDomainLogger = new ConsoleDomainLogger()
  it("Test ConsoleDomainLogger", () => {
    const infoSpy = jest.spyOn(console, 'info')
    const errorSpy = jest.spyOn(console, 'error')
    const warnSpy = jest.spyOn(console, 'warn')
    const debugSpy = jest.spyOn(console, 'debug')
    consoleDomainLogger.setContext("Test")
    expect(consoleDomainLogger.context()).toBe("Test")

    consoleDomainLogger.info("Hello Tun.pt")
    expect(infoSpy).toHaveBeenCalledWith('[Test] Hello Tun.pt')
    consoleDomainLogger.error("Hello Tun.pt")
    expect(errorSpy).toHaveBeenCalledWith('[Test] Hello Tun.pt [No trace info]')
    consoleDomainLogger.warn("Hello Tun.pt")
    expect(warnSpy).toHaveBeenCalledWith('[Test] Hello Tun.pt')
    consoleDomainLogger.debug("Hello Tun.pt")
    expect(debugSpy).toHaveBeenCalledWith('[Test] Hello Tun.pt')
  })
})

