package main

import (
	"io/fs"
	"mime"
	"os"
	"path"
	"strings"
)

type FileInfoRequest struct {
	Path PragoxPath
}

type FileInfoData struct {
	Icon  string
	Name  string
	IsDir bool
	Path  PragoxPath

	MimeType string

	ChangeDataHuman string
	SizeHuman       string
	KindHuman       string
}

func FileInfo(request *FileInfoRequest) *FileInfoData {
	return FileInfoFromPath(PragoxPath(request.Path))
}

func FileInfoFromPath(pragoxPath PragoxPath) *FileInfoData {
	diskPath, err := parseLocalhostPath(pragoxPath)
	if err != nil {
		panic(err)
	}

	fileInfo, err := os.Stat(diskPath)
	if err != nil {
		panic(err)
	}

	return getFileInfoFromOS(fileInfo, PragoxPath(path.Join("/localhost", diskPath)))

}

func getFileInfoFromOS(fileinfo fs.FileInfo, pragoxPath PragoxPath) *FileInfoData {
	var ret = &FileInfoData{}
	ret.Name = fileinfo.Name()

	ret.Path = pragoxPath

	ret.IsDir = fileinfo.IsDir()

	ret.ChangeDataHuman = fileinfo.ModTime().Format("02. 01. 2006 15:04:05")
	ret.SizeHuman = ByteCountDecimal(fileinfo.Size())

	mimeTyp := mime.TypeByExtension(path.Ext(fileinfo.Name()))
	ret.MimeType = mimeTyp

	if ret.IsDir {
		ret.KindHuman = "Folder"
	} else {
		ret.KindHuman = "Document"
	}

	if ret.IsDir {
		ret.Icon = "🗂"
		ret.SizeHuman = "—"
	} else {
		ret.Icon = "📄"
		if strings.HasPrefix(ret.MimeType, "image/") {
			ret.Icon = "🖼"
		}
		if strings.HasPrefix(ret.MimeType, "video/") {
			ret.Icon = "▶️"
		}
		if strings.HasPrefix(ret.MimeType, "audio/") {
			ret.Icon = "🎵"
		}
		if strings.HasPrefix(ret.MimeType, "application/pdf") {
			ret.Icon = "📃"
		}
	}

	return ret
}
