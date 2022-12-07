#include "llTesterWS.h"
#include "server/http.h"
#include <iostream>
#include <fstream>
#include <stdexcept>
#include <filesystem>

using std::vector;
typedef std::string string;
typedef std::fstream fstream;
typedef std::ios ios;

int expectedResult = 0;
string templateContent = "";

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

void replace_placeholder(const string& replacement, string& outResult)
{
    static const string placeholder = "{{PlaceHolder}}";
    outResult = templateContent;
    outResult.replace(outResult.find(placeholder), placeholder.length(), replacement);
}

string exec(const char* cmd) {
    char buffer[128];
    string result = "";
    FILE* pipe = popen(cmd, "r");
    if (!pipe) throw std::runtime_error("popen() failed!");
    try {
        while (fgets(buffer, sizeof buffer, pipe) != NULL) {
            result += buffer;
        }
    } catch (...) {
        pclose(pipe);
        throw;
    }
    pclose(pipe);
    return result;
}

void handler(HTTP::Request req, HTTP::Response res) 
{
    vector<HTTP::Header> headers;
    headers.push_back(HTTP::Header("Server", "Basic HTTP Server"));

    string content = "";
    join(req.get_content(), '\n', content);

    string finalIR = "";
    replace_placeholder(content, finalIR);

    {
        std::ofstream replacedFile("IR/replaced.ll");
        replacedFile << finalIR;
        replacedFile.close();
    }
    string executionResult = exec("lli IR/replaced.ll");

    res.set_headers(headers);
    res.set_content(executionResult);
    res.send();
    res.close();
}

bool contents_of(string path_to_file, string& outContent)
{
    std::ifstream file(path_to_file) ;
    if (!file)
        return false;

    outContent = { std::istreambuf_iterator<char>(file), std::istreambuf_iterator<char>{} };
    return true;
}

int main()
{
    HTTP::Server server;
    std::filesystem::path path = "IR/template_linux.ll";
    std::cout << "Absolute path " << std::filesystem::absolute(path) << '\n';

    if (!contents_of(path, templateContent))
        return 1;

    server.handle = &handler;
    server.listen(8080);

    return 0;
}