namespace GDB.Common.DTOs.BusinessModel
{
    public class BusinessModelEventOperation
    {
        public OperationType Action { get; set; }
        public string ObjectId { get; set; }
        public string ParentId { get; set; }
        public object? Value { get; set; }
        public bool? Insert { get; set; }
        public string? Field { get; set; }
    }

    public enum OperationType {
        Set = 1,
        Delete = 2,
        MakeList = 3,
        MakeObject = 4
    }
}