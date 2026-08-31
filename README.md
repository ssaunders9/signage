# Tutoring Hours Signage

A lightweight, internally hosted webpage for an Xibo digital signage display. It is designed to occupy a half-screen region and requires no build process or external services.

## Update the schedule

Staff only need to edit [`data/tutoring_hours.json`](data/tutoring_hours.json):

- `updated_at`: change this whenever the schedule is edited, using an ISO date/time.
- `settings.display_window_hours`: number of upcoming hours shown (6 is a good starting point).
- `schedule`: add, remove, or update tutoring blocks.
- `classes`: a list of course codes; it can contain up to 10 or more courses.
- `active`: set to `false` to temporarily hide a tutoring block without deleting it.

Each schedule item uses 24-hour times such as `09:00` and `13:30`. The display automatically reloads the JSON every five minutes and refreshes its clock every 30 seconds.

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

The current layout uses high contrast, large type, a rolling six-hour window, and cards that highlight tutoring happening now. If staff find the class list too dense, reduce the display window or shorten course labels in the data file.
