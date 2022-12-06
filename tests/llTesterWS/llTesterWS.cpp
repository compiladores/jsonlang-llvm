#include "llTesterWS.h"
#include "server/http.h"

using std::vector;
typedef std::string string;

int expectedResult = 0;

void join(const vector<string>& v, char c, string& s) 
{
   s.clear();

   for (vector<string>::const_iterator p = v.begin();
        p != v.end(); ++p) {
      s += *p;
      if (p != v.end() - 1)
        s += c;
   }
}

void handler(HTTP::Request req, HTTP::Response res) 
{
    vector<HTTP::Header> headers;
    headers.push_back(HTTP::Header("Server", "Basic HTTP Server"));

    vector<string> content = req.get_content();
    content.push_back("HELLO");

    string response;
    join(content, '@', response);

    res.set_headers(headers);
    res.set_content(response);
    res.send();
    res.close();
}

int main()
{
    HTTP::Server server;

    server.handle = &handler;
    server.listen(8080);

    return 0;
}