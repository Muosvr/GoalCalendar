var authorizeButton = null;
var signoutButton = null;
var eventList = [];

function handleClientLoad() {
        // Loads the client library and the auth2 library together for efficiency.
        // Loading the auth2 library is optional here since `gapi.client.init` function will load
        // it if not already loaded. Loading it upfront can save one network request.
  gapi.load('client:auth2', initClient);
  authorizeButton = document.getElementById('signin-button');
  signoutButton = document.getElementById('signout-button');
}

function initClient() {
  // Initialize the client with API key and People API, and initialize OAuth with an
  // OAuth 2.0 client ID and scopes (space delimited string) to request access.
  gapi.client.init({
      apiKey: get_key(),
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      clientId: '568249120290-13q4r09h6jldf1lj5d19jo3c3tbbsuhd.apps.googleusercontent.com',
      scope: "https://www.googleapis.com/auth/calendar.readonly"
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

    authorizeButton.onclick = handleSignInClick;
    signoutButton.onclick = handleSignOutClick;
  });
}

function updateSigninStatus(isSignedIn) {
  // When signin status changes, this function is called.
  // If the signin status is changed to signedIn, we make an API call.
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'inline-block';
    $("#update_availability").css("display", "inline-block");
    listUpcomingEvents();
  }else {
    authorizeButton.style.display = 'inline-block';
    signoutButton.style.display = 'none';
    $("#update_availability").css("display", "none");
  }
}


function handleSignInClick(event) {
  // Ideally the button should only show up after gapi.client.init finishes, so that this
  // handler won't be called before OAuth is initialized.
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function makeApiCall() {
  // Make an API call to the People API, and print the user's given name.
  listUpcomingEvents()
}

function listUpcomingEvents(){
  var date = new Date();
  date.setDate(date.getDate() + 7);
  // console.log(date);
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'timeMax': date.toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    // 'maxResults': 10,
    'orderBy': 'startTime'
  }).then(function(response) {
    eventList = response.result.items;
    // console.log(eventList);
  });
}
