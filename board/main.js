var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  /*
  *     HOME 화면
  */
  if(pathname === '/'){                                 // 홈화면 부분 (url)            
    if(queryData.id === undefined){                     // 홈화면이므로 query string은 없는거임 (undefined)
      fs.readdir('./data', (error, filelist) => {   // data path를 읽어서 error가 아니면 file list를 보여줌
        var title = 'CRE GROUND';
        var description = 'This is your ground';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `<h2>${title}</h2>
          <p>${description}</p>`, `<a href="/create">생성</a>`
      );
        response.writeHead(200);
        response.end(html);
      });
    }
    /*
    *   data 디렉토리 읽어오기 (sanitized)
    */ 
    else{
      fs.readdir('./data', (error, filelist) => {

       var fileteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${fileteredId}`, 'utf8', (err, description) => {        // 세미나 참조

          var title = queryData.id;
          var sanitizedTitle=sanitizeHtml(title);
          var sanitizedDescription=sanitizeHtml(description);
          var list = template.list(filelist);
          var html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`, `<a href="/create">생성</a>
          <a href="/update?id=${sanitizedTitle}">수정</a>
          <form action="delete_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <input type="submit" value="삭제">
          </form>`
        );

        response.writeHead(200);
        response.end(html);
      });
    });
    }
  }

  /*
  *     게시글 생성
  */
  else if(pathname === '/create'){
    fs.readdir('./data', (error, filelist) => {
      var title ='CRE GROUND';
      var list = template.list(filelist);
      var html = template.HTML(title, list,  `
        <form action="/create_process" method="post">
        <p><input type="text" name ="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
          <input type="submit">
          </p>
          </form>
          `, '');
      response.writeHead(200);
      response.end(html);
    });
  }
  /*
  *     create가 submit되었을때 데이터 저장
  */

  else if(pathname==='/create_process'){
    var body = '';
    request.on('data', (data) => {
      body = body + data;
    });
    request.on('end', () => {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      })
    });
  }

  /*
  *     수정 버튼을 눌러쓸때
  */
  else if(pathname === '/update'){
    fs.readdir('./data', (error, filelist) => {
        var fileteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${fileteredId}`, 'utf8', (err, description) => {

          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
          `
          <form action = "/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
          <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
            </p>
            </form>
          `,
        `<a href="/create"><create</a><a href="/update?id=${title}">수정</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
  });
}
/*
*     수정이 완료 되었을때 데이터 저장
*/
else if(pathname === '/update_process'){
  var body = '';
  request.on('data', (data) => {
    body = body + data;
  });
  request.on('end', () => {
    var post = qs.parse(body);
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, (error) => {
      fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      })
    });
  });
  }

  /*
  *   삭제버튼 눌렀을 때 삭제해주기
  */

  else if(pathname==='/delete_process'){
    var body='';
    request.on('data', (data) => {
      body = body + data;
    });
    request.on('end', () => {
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, (error) => {
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    });
  }

  /*
  *  그 외 페이지 이동시 404 not found 오류 페이지
  */
  else{
    response.writeHead(404);
    response.end('Not found');
  }
});

/*
*     포트번호 3000
*/
app.listen(3000, () => {
  console.log('Server is running...');
  console.log('Connected 8080 port!!');
});
