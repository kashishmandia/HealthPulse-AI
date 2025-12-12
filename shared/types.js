/**
 * Shared TypeScript types across HealthPulse AI
 * This ensures type safety between frontend and backend
 */
export var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "PATIENT";
    UserRole["PROVIDER"] = "PROVIDER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (UserRole = {}));
export var SeverityLevel;
(function (SeverityLevel) {
    SeverityLevel["LOW"] = "LOW";
    SeverityLevel["MEDIUM"] = "MEDIUM";
    SeverityLevel["HIGH"] = "HIGH";
    SeverityLevel["CRITICAL"] = "CRITICAL";
})(SeverityLevel || (SeverityLevel = {}));
export var MoodLevel;
(function (MoodLevel) {
    MoodLevel[MoodLevel["VERY_POOR"] = 1] = "VERY_POOR";
    MoodLevel[MoodLevel["POOR"] = 2] = "POOR";
    MoodLevel[MoodLevel["NEUTRAL"] = 3] = "NEUTRAL";
    MoodLevel[MoodLevel["GOOD"] = 4] = "GOOD";
    MoodLevel[MoodLevel["EXCELLENT"] = 5] = "EXCELLENT";
})(MoodLevel || (MoodLevel = {}));
//# sourceMappingURL=types.js.map