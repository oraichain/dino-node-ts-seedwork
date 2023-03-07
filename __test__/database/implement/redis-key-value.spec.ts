import { RedisKeyValueRepository } from '@ports/database/keyvalue/implement/redis/RedisKeyValueRepository'

describe("test redis port", () => {
  it("test get set", async () => {
    const testKey = "tuan"
    const testValue = "hoi"
    const redisKeyValueRepository = await RedisKeyValueRepository.factory("localhost", 6370, "tuan", "tuan", "abc")
    await redisKeyValueRepository.set(testKey, testValue)
    const persistedValue = await redisKeyValueRepository.get(testKey)
    expect(persistedValue).toBe(testValue)
  })
})
