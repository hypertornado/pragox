package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"os"
)

//go:embed templates/app.tmpl
var appTemplate []byte

//go:embed javascript/pragox.js
var javascript []byte

//go:embed css/index.css
var style []byte

type Handler struct {
}

func (h Handler) ServeHTTP(response http.ResponseWriter, request *http.Request) {

	if request.Method == "GET" && request.URL.Path == "/pragox.js" {
		if devMode {
			var err error
			javascript, err = os.ReadFile("javascript/pragox.js")
			if err != nil {
				panic(err)
			}
		}

		response.Write(javascript)
		return
	}

	if request.Method == "GET" && request.URL.Path == "/pragox.css" {

		if devMode {
			var err error
			style, err = os.ReadFile("css/index.css")
			if err != nil {
				panic(err)
			}
		}

		response.Header().Set("Content-Type", "text/css")
		response.Write(style)
		return
	}

	if request.Method == "POST" {
		switch request.URL.Path {
		case "/api/list":
			API(response, request, List)
			return
		case "/api/fileinfo":
			API(response, request, FileInfo)
			return
		case "/api/apps":
			API(response, request, GetApps)
			return
		}
	}

	if request.Method == "GET" {
		switch request.URL.Path {
		case "/api/download":
			Download(response, request)
			return
		}

		for _, app := range apps {
			if app.URL == request.URL.Path {
				app.RenderApp(response, request)
				return
			}
		}

	}

	Render404(response, request)
}

func (app *App) RenderApp(response http.ResponseWriter, request *http.Request) {
	t := template.New("")
	if devMode {
		var err error
		appTemplate, err = os.ReadFile("templates/app.tmpl")
		if err != nil {
			panic(err)
		}
	}

	t, err := t.Parse(string(appTemplate))
	if err != nil {
		panic(err)
	}

	data := map[string]interface{}{}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	appData, err := json.Marshal(app)
	if err != nil {
		panic(err)
	}

	data["app_data"] = string(appData)

	data["app_id"] = app.ID
	data["app_name"] = app.Name
	data["base_dir"] = fmt.Sprintf("/localhost%s", homeDir)

	t.ExecuteTemplate(response, "app", data)

}

func Render404(response http.ResponseWriter, request *http.Request) {
	response.WriteHeader(404)
	response.Write([]byte("404 - page not found"))
}
