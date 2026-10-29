using System.Text.Json;

namespace WebAPI.Services;

/// <summary>
/// Klient mot den interna händelseloggen (repot kanban-eventlog). Adressen sätts med
/// <c>EventLog:Url</c>; saknas den gör klienten ingenting. Fel loggas men kastas aldrig vidare,
/// så att tavlan fungerar även när händelseloggen inte gör det.
/// </summary>
public class EventLogClient(HttpClient http, ILogger<EventLogClient> logger)
{
    public bool IsConfigured => http.BaseAddress is not null;

    public async Task LogAsync(string type, string message, object? data = null)
    {
        if (!IsConfigured) return;
        try
        {
            var response = await http.PostAsJsonAsync("events", new { type, message, data });
            response.EnsureSuccessStatusCode();
        }
        catch (Exception e)
        {
            logger.LogWarning(e, "Kunde inte skicka händelse {Type} till händelseloggen", type);
        }
    }

    /// <summary>Senaste händelserna som rå JSON, eller null om händelseloggen inte nås.</summary>
    public async Task<JsonElement?> GetLatestAsync(int limit)
    {
        if (!IsConfigured) return null;
        try
        {
            return await http.GetFromJsonAsync<JsonElement>($"events?limit={limit}");
        }
        catch (Exception e)
        {
            logger.LogWarning(e, "Kunde inte hämta händelser från händelseloggen");
            return null;
        }
    }
}
