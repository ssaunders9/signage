# Tutoring Hours Signage

A lightweight, internally hosted webpage for an Xibo digital signage display. It is designed to occupy a half-screen region and requires no build process or external services.

## Update the schedule

Staff only need to edit [`data/tutoring_hours.csv`](data/tutoring_hours.csv):

- `Day`: weekday name, such as `Monday`.
- `Start` and `End`: times such as `10:00 AM` and `1:00 PM`.
- `Courses`: semicolon-separated course codes; use 3–10 courses as needed.
- `Active`: use `Yes` or `No` to show or hide a row.

The display automatically reloads the CSV every five minutes and refreshes its clock every 30 seconds.

## Run locally

Because browsers restrict `fetch()` from local files, serve this folder over HTTP:

```text
cd /config/workspace/VCEA/Tutoring_Hours_Signage
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. For internal hosting, place this folder behind the department's normal web server and point Xibo at its internal URL.

## Xibo setup suggestions

1. Create a region sized to approximately 50% of the display height or width, depending on the intended layout.
2. Use a 16:9 preview and test the actual player resolution before deployment.
3. Set the Xibo webpage widget to the internal URL for this project.
4. Disable browser zoom and use the display's native resolution.
5. Keep the page's automatic refresh enabled so schedule changes appear without manually restarting the layout.

The current layout uses high contrast, large type, a rolling six-hour window, and cards that highlight tutoring happening now. If staff find the class list too dense, shorten course labels in the CSV.
