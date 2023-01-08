package main

type App struct {
	ID   string
	Icon string
	Name string
	URL  string
}

var apps = []*App{
	{
		ID:   "home",
		Icon: "🌍",
		Name: "Pragox",
		URL:  "/",
	},
	{
		ID:   "files",
		Icon: "🗂",
		Name: "Files",
		URL:  "/files",
	},
	{
		ID:   "preview",
		Icon: "👀",
		Name: "Preview",
		URL:  "/preview",
	},
}

type AppsRequest struct{}

type AppsResponse struct {
	Apps []*App
}

func GetApps(in *AppsRequest) *AppsResponse {
	return &AppsResponse{
		Apps: apps,
	}
}
