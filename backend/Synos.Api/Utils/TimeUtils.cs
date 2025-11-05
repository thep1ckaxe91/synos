namespace Synos.Api.Utils
{
    public static class TimeUtils
    {
        /// <summary>
        /// Vietnam timezone (UTC+7)
        /// </summary>
        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        /// <summary>
        /// Get current Vietnam time (UTC+7)
        /// </summary>
        /// <returns>Current datetime in Vietnam timezone</returns>
        public static DateTime GetVietnamTime()
        {
            return TimeZoneInfo.ConvertTime(DateTime.UtcNow, VietnamTimeZone);
        }

        /// <summary>
        /// Get current Vietnam time (UTC+7) - alias for consistency
        /// </summary>
        /// <returns>Current datetime in Vietnam timezone</returns>
        public static DateTime GetCurrentTime()
        {
            return GetVietnamTime();
        }

        /// <summary>
        /// Convert UTC time to Vietnam time
        /// </summary>
        /// <param name="utcTime">UTC datetime</param>
        /// <returns>Vietnam datetime</returns>
        public static DateTime ConvertToVietnamTime(DateTime utcTime)
        {
            return TimeZoneInfo.ConvertTime(utcTime, VietnamTimeZone);
        }

        /// <summary>
        /// Convert Vietnam time to UTC
        /// </summary>
        /// <param name="vietnamTime">Vietnam datetime</param>
        /// <returns>UTC datetime</returns>
        public static DateTime ConvertToUtc(DateTime vietnamTime)
        {
            return TimeZoneInfo.ConvertTime(vietnamTime, VietnamTimeZone, TimeZoneInfo.Utc);
        }

        /// <summary>
        /// Get formatted Vietnam time string
        /// </summary>
        /// <param name="format">Date format (default: yyyy-MM-dd HH:mm:ss)</param>
        /// <returns>Formatted Vietnam time string</returns>
        public static string GetFormattedVietnamTime(string format = "yyyy-MM-dd HH:mm:ss")
        {
            return GetVietnamTime().ToString(format);
        }

        /// <summary>
        /// Get Vietnam time for database operations (soft delete timestamp)
        /// </summary>
        /// <returns>Vietnam datetime for deletion timestamp</returns>
        public static DateTime GetDeleteTimestamp()
        {
            return GetVietnamTime();
        }

        /// <summary>
        /// Get Vietnam time for creation timestamp
        /// </summary>
        /// <returns>Vietnam datetime for creation timestamp</returns>
        public static DateTime GetCreateTimestamp()
        {
            return GetVietnamTime();
        }

        /// <summary>
        /// Get Vietnam time for update timestamp
        /// </summary>
        /// <returns>Vietnam datetime for update timestamp</returns>
        public static DateTime GetUpdateTimestamp()
        {
            return GetVietnamTime();
        }

        /// <summary>
        /// Check if a datetime is in Vietnam timezone
        /// </summary>
        /// <param name="dateTime">Datetime to check</param>
        /// <returns>True if the datetime appears to be Vietnam time</returns>
        public static bool IsVietnamTime(DateTime dateTime)
        {
            // This is a simple heuristic - in a real app you'd track timezone info
            var utcNow = DateTime.UtcNow;
            var vnNow = GetVietnamTime();
            var diff = Math.Abs((dateTime - vnNow).TotalHours);
            
            return diff < Math.Abs((dateTime - utcNow).TotalHours);
        }

        /// <summary>
        /// Get timezone info string
        /// </summary>
        /// <returns>Vietnam timezone information</returns>
        public static string GetTimezoneInfo()
        {
            return $"Vietnam Time (UTC+7) - {VietnamTimeZone.DisplayName}";
        }
    }
}