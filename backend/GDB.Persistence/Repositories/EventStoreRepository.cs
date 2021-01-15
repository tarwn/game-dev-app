using Dapper;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class EventStoreRepository : BaseRepository, IEventStoreRepository
    {
        public EventStoreRepository(string connectionString) : base(connectionString)
        { }

        public async Task CreateEventAsync(int studioId, int gameId, string objectType, ChangeEvent changeEvent)
        {
            var param = new { 
                studioId, 
                gameId, 
                objectType, 
                changeEvent.VersionNumber,
                rawEvent = JsonSerializer.Serialize(changeEvent, GetJsonOptions())
            };
            var sql = @"
                INSERT INTO dbo.EventStore(StudioId, GameId, ObjectType, VersionNumber, RawEvent)
                VALUES(@StudioId, @GameId, @ObjectType, @VersionNumber, @RawEvent);
            ";

            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

        public async Task<List<ChangeEvent>> GetEventsAsync(int studioId, int gameId, string objectType, int sinceVersionNumber)
        {
            var param = new { studioId, gameId, objectType, sinceVersionNumber };
            var sql = @"
                SELECT Id,
                        StudioId,
                        GameId,
                        ObjectType,
                        VersionNumber,
                        RawEvent
                FROM dbo.EventStore
                WHERE StudioId = @StudioId
                    AND GameId = @GameId
                    AND ObjectType = @ObjectType
                    AND VersionNumber > @SinceVersionNumber
                ORDER BY VersionNumber;
            ";

            using (var conn = GetConnection())
            {
                var rawEvents = await conn.QueryAsync<EventStoreEntry>(sql, param);
                var eventsString = "[" + String.Join(',', rawEvents.Select(r => r.RawEvent)) + "]";
                var events = JsonSerializer.Deserialize<List<ChangeEvent>>(eventsString, GetJsonOptions());
                return events;
            }
        }

        private JsonSerializerOptions GetJsonOptions()
        {
            return new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public class EventStoreEntry
        {
            public int Id { get; set; }
            public int StudioId { get; set; }
            public string ObjectType { get; set; }
            public int VersionNumber { get; set; }
            public string RawEvent { get; set; }
        }
    }
}
