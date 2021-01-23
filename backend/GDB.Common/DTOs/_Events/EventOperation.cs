using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace GDB.Common.DTOs._Events
{
    public class EventOperation
    {
        public OperationType Action { get; set; }
        public string ObjectId { get; set; }
        public string ParentId { get; set; }
        public object? Value { get; set; }
        public bool? Insert { get; set; }
        public string? Field { get; set; }

        [JsonPropertyName("$type")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ValueType Type { get; set; }
    }

    public enum OperationType
    {
        Set = 1,
        Delete = 2,
        MakeList = 3,
        MakeObject = 4
    }

    public enum ValueType
    { 
        unknown = 0,
        @string = 1,
        date = 2,
        time = 3,
        @decimal = 4,
        integer = 5,
        list = 6,
        @object = 7,
        boolean = 8
    }
}