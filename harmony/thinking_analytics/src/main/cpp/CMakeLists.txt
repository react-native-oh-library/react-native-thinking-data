cmake_minimum_required(VERSION 3.13)
set(CMAKE_SYSTEM_VERSION 7)
project(rnoh_thinking_data)

file(GLOB LOCAL_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_thinking_data SHARED ${LOCAL_SRC})
target_include_directories(rnoh_thinking_data PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_thinking_data PUBLIC rnoh)
