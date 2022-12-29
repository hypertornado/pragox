package main

import (
	_ "embed"
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

	if request.Method == "GET" && request.URL.Path == "/" {
		RenderApp(response, request)
		return
	}

	Render404(response, request)
}

func RenderApp(response http.ResponseWriter, request *http.Request) {
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
	t.ExecuteTemplate(response, "app", nil)

}

func Render404(response http.ResponseWriter, request *http.Request) {
	response.WriteHeader(404)
	response.Write([]byte("404 - page not found"))
}
