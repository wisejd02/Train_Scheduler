	 // Initialize Firebase
     var config = {
        apiKey: "AIzaSyBk2pHNz0EinDznYAMc6g_quxiE5uByHzQ",
        authDomain: "fir-proj-fc54a.firebaseapp.com",
        databaseURL: "https://fir-proj-fc54a.firebaseio.com",
        projectId: "fir-proj-fc54a",
        storageBucket: "fir-proj-fc54a.appspot.com",
        messagingSenderId: "936997790614"
     };
     firebase.initializeApp(config);
     var database = firebase.database();
     var trainName = "";
     var trainDest = "";
     var trainFreq = "";
     var trainFreq = "";

     database.ref("train_schedule").orderByChild("dateAdded").on("child_added", function(response) {
         var dbUID;
         var tFrequency = response.val().trainFreq;
         var firstTimeConverted = moment(response.val().firstTrain, "hh:mm").subtract(1, "years");
         // Current Time
         var currentTime = moment();
         // Difference between the times
         var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
         // Time apart (remainder)
         var tRemainder = diffTime % tFrequency;
         // Minute Until Train
         var tMinutesTillTrain = tFrequency - tRemainder;
         // Next Train
         var nextTrain = moment().add(tMinutesTillTrain, "minutes").format("HH:mm");

         $("tbody").append(`
             <tr id="${response.key}">
                <td><button class="btn btn-edit btn-upd">Edit</button>
                <button class="btn btn-edit btn-del onclick="onClickDelete('')">Delete</button></td>
                <td>${response.val().trainName}</td>
                <td>${response.val().trainDest}</td>
                <td>${response.val().firstTrain}</td>
                <td>${response.val().trainFreq}</td>
                <td>${nextTrain}</td>
                <td>${tMinutesTillTrain}</td>
             </tr>`)
        $("button.btn-upd").click( function(){
            console.log("Edit");
            //console.log($(this).parents('tr')[0]);
            var currentTD = $(this).parents('tr').find('td');
          if ($(this).html() == 'Edit') {
              currentTD = $(this).parents('tr').find('td');
              console.log(currentTD);
              
              $.each(currentTD, function (index, val) {
                  console.log(this);
                  console.log(index);
                  if(index != 0 && index < 5){
                    $(this).prop('contenteditable', true)
                  }
                  
              });
          } else {
             $.each(currentTD, function () {
                 console.log("save should be")
                  $(this).prop('contenteditable', false)
              });
              dbUID = $(this).parents('tr')[0].id;
              var updateTrainData = {
                trainName: $(this).parents('tr')[0].cells[1].innerHTML.trim(),
                 trainDest: $(this).parents('tr')[0].cells[2].innerHTML.trim(),
                firstTrain: moment($(this).parents('tr')[0].cells[3].innerHTML.trim(), "HHmm").format("HH:mm"),
                 trainFreq: $(this).parents('tr')[0].cells[4].innerHTML.trim(),
                 dateAdded: firebase.database.ServerValue.TIMESTAMP
              }
              database.ref("train_schedule/"+dbUID).set(updateTrainData);
          }

          $(this).html($(this).html() == 'Edit' ? 'Save' : 'Edit')
        });
        $(".btn-del").click( function(){
            dbUID = $(this).parents('tr')[0].id;
            console.log("delete");
            console.log($(this).parents('tr'));
            $(this).parents('tr')[0].remove()
            database.ref("train_schedule/"+dbUID).remove()
        });
     });


     $("#btnFrmSubmit").click( function(e){
         e.preventDefault();
         var formData = {
             trainName: $("#trainName").val().trim(),
             trainDest: $("#trainDest").val().trim(),
            firstTrain: moment($("#firstTrain").val().trim(), "HHmm").format("HH:mm"),
             trainFreq: $("#trainFreq").val().trim(),
             dateAdded: firebase.database.ServerValue.TIMESTAMP
         };
         updateTrain(formData);
         var formEntry = $(".form-control");
         $.each(formEntry, function( index, value ) {
            $("#"+formEntry[index].id).val("");
         });
         // database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
         // 	var sv = snapshot.val();
         // 	console.log(sv);


         // });
     });
     

     $("tr").click( function(){
         console.log("tr");
         console.log(this);
     });
     function updateTrain(obj){
        database.ref("train_schedule").push(obj);

     };