package main

import (
	"encoding/json"
	"net/http"
)

func API[Tin, Tout any](response http.ResponseWriter, request *http.Request, handler func(*Tin) *Tout) {
	var item Tin
	err := json.NewDecoder(request.Body).Decode(&item)
	if err != nil {
		panic(err)
	}

	result := handler(&item)

	jsonData, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}
	response.Write(jsonData)
}
