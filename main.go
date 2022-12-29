package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

const port int64 = 8500

var devMode bool

func main() {
	parseCommandLineParameters()
	fmt.Printf("Starting pragox server at port %d\n", port)
	address := fmt.Sprintf(":%d", port)
	if err := http.ListenAndServe(address, Handler{}); err != nil {
		log.Fatal(err)
	}

}

func parseCommandLineParameters() {
	if len(os.Args) == 2 && os.Args[1] == "dev" {
		devMode = true
		return
	}

	if len(os.Args) == 1 {
		return
	}
	panic("wrong command line arguments for pragox")
}
