package main

import "io/ioutil"

type DownloadRequest struct {
	Path string
}

type DownloadResponse struct {
	Data string
}

func Download(request *DownloadRequest) *DownloadResponse {
	osPath, err := parseLocalhostPath(request.Path)
	if err != nil {
		panic(err)
	}
	data, err := ioutil.ReadFile(osPath)
	if err != nil {
		panic(err)
	}
	return &DownloadResponse{
		Data: string(data),
	}
}
