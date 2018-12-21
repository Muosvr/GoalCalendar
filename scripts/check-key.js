function check_key() {
  if (typeof get_key != "undefined") {
    console.log("local api-key found");
    return get_key();
  } else {
    console.log("local api-key not found, using environment variable");
    return ProcessingInstruction.env.GC - API;
  }
}
