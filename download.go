package main

import (
	"net/http"
	"os"
	"time"
)

func Download(response http.ResponseWriter, request *http.Request) {
	reqPath := request.URL.Query().Get("path")

	osPath, err := parseLocalhostPath(PragoxPath(reqPath))
	if err != nil {
		panic(err)
	}

	//http.ServeFile(response, request, osPath)

	file, err := os.Open(osPath)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	http.ServeContent(response, request, "", time.Now(), file)

}
