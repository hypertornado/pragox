package main

type App struct {
	ID   string
	Name string
	URL  string
}

var apps = []*App{
	{
		ID:   "home",
		Name: "Pragox",
		URL:  "/",
	},
	{
		ID:   "files",
		Name: "Files",
		URL:  "/files",
	},
	{
		ID:   "preview",
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
