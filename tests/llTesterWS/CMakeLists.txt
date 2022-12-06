# CMakeList.txt : CMake project for llTesterWS, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.8)

project ("llTesterWS")

if (UNIX)
	add_compile_definitions(ISLINUX)
endif (UNIX)

# Add source to this project's executable.
file(GLOB SOURCES
    server/*.h
    server/*.cpp
)
add_executable (llTesterWS  ${SOURCES} "llTesterWS.cpp" "llTesterWS.h" )

if (CMAKE_VERSION VERSION_GREATER 3.12)
  set_property(TARGET llTesterWS PROPERTY CXX_STANDARD 20)
endif()

# TODO: Add tests and install targets if needed.
