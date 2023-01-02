package main

import (
	"fmt"
	"io/ioutil"
	"path"
	"sort"
	"strings"

	"golang.org/x/text/collate"
	"golang.org/x/text/language"
)

type ListRequest struct {
	Path string
}

type ListResponse struct {
	ParentPath string
	Files      []*FileInfo
}

type FileInfo struct {
	Icon  string
	Name  string
	IsDir bool
	Path  string

	ChangeDataHuman string
	SizeHuman       string
	KindHuman       string
}

func List(req *ListRequest) *ListResponse {
	ret := &ListResponse{}

	diskPath, err := parseLocalhostPath(req.Path)
	if err != nil {
		panic(err)
	}

	infos, err := ioutil.ReadDir(diskPath)
	if err != nil {
		panic(err)
	}

	ret.ParentPath = createLocalhostPath(path.Dir(diskPath))

	for _, info := range infos {
		var file = &FileInfo{}
		file.Name = info.Name()

		file.Path = path.Join("/localhost", diskPath, info.Name())

		file.IsDir = info.IsDir()

		file.ChangeDataHuman = info.ModTime().Format("02. 01. 2006 15:04:05")
		file.SizeHuman = fmt.Sprintf("%d B", info.Size())

		if file.IsDir {
			file.KindHuman = "Folder"
		} else {
			file.KindHuman = "Document"
		}

		if file.IsDir {
			file.Icon = "🗂"
			file.SizeHuman = "—"
		} else {
			file.Icon = "📄"
		}

		ret.Files = append(ret.Files, file)
	}

	sortFiles(ret.Files)

	return ret
}

func parseLocalhostPath(in string) (string, error) {
	if in == "/localhost" {
		return "/", nil
	}

	bef, after, found := strings.Cut(in, "/localhost/")
	if found && bef == "" {
		return "/" + after, nil
	}
	return "", fmt.Errorf("wrong format of localhost path: %s", in)
}

func createLocalhostPath(in ...string) string {
	in = append([]string{"/localhost"}, in...)
	return path.Join(in...)
}

func sortFiles(arr []*FileInfo) {
	sortArray(arr, func(a, b *FileInfo) bool {
		if a.IsDir && !b.IsDir {
			return true
		}

		if !a.IsDir && b.IsDir {
			return false
		}

		collator := collate.New(language.Czech)
		if collator.CompareString(a.Name, b.Name) <= 0 {
			return true
		} else {
			return false
		}
	})
}

func sortArray[T any](data []T, fn func(a, b T) bool) {
	sort.Slice(data, func(i, j int) bool {
		a := data[i]
		b := data[j]
		return fn(a, b)
	})
}
