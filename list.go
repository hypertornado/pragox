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

type PragoxPath string

type ListRequest struct {
	Path PragoxPath
}

type ListResponse struct {
	CurrentPath    PragoxPath
	ParentPath     PragoxPath
	CurrentDirInfo *FileInfoData
	Files          []*FileInfoData
}

func List(req *ListRequest) *ListResponse {
	if req.Path == "/" {
		return ListRoot((req))
	}
	if req.Path == "/localhost" || strings.HasPrefix(string(req.Path), "/localhost/") {
		return ListLocalhost((req))
	}
	panic("unknown path to list " + req.Path)
}

func ListRoot(req *ListRequest) *ListResponse {
	ret := &ListResponse{
		CurrentPath:    "/",
		ParentPath:     "",
		CurrentDirInfo: &FileInfoData{
			//""
		},
	}
	return ret
}

func ListLocalhost(req *ListRequest) *ListResponse {
	ret := &ListResponse{}

	diskPath, err := parseLocalhostPath(req.Path)
	if err != nil {
		panic(err)
	}

	infos, err := ioutil.ReadDir(diskPath)
	if err != nil {
		panic(err)
	}

	ret.ParentPath = PragoxPath(createLocalhostPath(
		path.Dir(diskPath),
	))

	for _, info := range infos {
		ret.Files = append(ret.Files, getFileInfoFromOS(info, PragoxPath(path.Join(string(req.Path), info.Name()))))
	}

	ret.CurrentPath = req.Path
	ret.CurrentDirInfo = FileInfo(&FileInfoRequest{req.Path})

	sortFiles(ret.Files)

	return ret
}

func parseLocalhostPath(in PragoxPath) (string, error) {
	if in == "/localhost" {
		return "/", nil
	}

	bef, after, found := strings.Cut(string(in), "/localhost/")
	if found && bef == "" {
		return "/" + after, nil
	}
	return "", fmt.Errorf("wrong format of localhost path: %s", in)
}

func createLocalhostPath(in ...string) string {
	in = append([]string{"/localhost"}, in...)
	return path.Join(in...)
}

func sortFiles(arr []*FileInfoData) {
	sortArray(arr, func(a, b *FileInfoData) bool {
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

func ByteCountDecimal(b int64) string {
	const unit = 1000
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(b)/float64(div), "kMGTPE"[exp])
}
