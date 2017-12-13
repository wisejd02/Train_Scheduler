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

     fbUpdate();
    function fbUpdate(){
        $("tr:gt(0)").remove();
        //update table on new item added in firebase 
        database.ref("train_schedule").orderByChild("dateAdded").on("child_added", function(response) {
            drawTable(response);
        });
    }
     function calcTime(tFrequency, firstTrain ){
        var firstTimeConverted = moment(firstTrain, "hh:mm").subtract(1, "years");
        // Current Time
        var currentTime = moment();
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // Time apart (remainder)
        var tRemainder = diffTime % tFrequency;

        //object contains
        // Next Train
        // Minute Until next Train
        var trainTime = {
            nextTrain: moment().add(tFrequency - tRemainder, "minutes").format("HH:mm"),
            tMinutesTillTrain: tFrequency - tRemainder
        };
        return trainTime;
     }


     
     function drawTable(response){
        var trainTime = calcTime(response.val().trainFreq, response.val().firstTrain);
        $("tbody").append(`
        <tr scope="row" id="${response.key}" >
           <td><button id="btn_${response.key}_upd" class="btn btn-edit" onclick="updateRow(this)">Edit</button>
           <button id="btn_${response.key}_del" class="btn btn-edit" onclick="deleteRow(this)">Delete</button></td>
           <td>${response.val().trainName}</td>
           <td>${response.val().trainDest}</td>
           <td>${response.val().firstTrain}</td>
           <td>${response.val().trainFreq}</td>
           <td>${trainTime.nextTrain}</td>
           <td>${trainTime.tMinutesTillTrain}</td>
        </tr>`)
     }

//inline row update for train 
     function updateRow(obj){
        var currentRow = $(obj).parents('tr')[0].id;
        if ($(obj).html() == 'Edit') {           
            $('#'+currentRow).each(function() {
                $.each(this.cells, function(index, val){
                    if(index != 0 && index <5){
                        $(this).prop('class','editRow');
                        $(this).prop('contenteditable', true)
                    }
                    
                });
            
            });
        }else {
            $('#'+currentRow).each(function() {
                $.each(this.cells, function () {
                    $(this).removeClass('editRow');
                    $(this).prop('contenteditable', false)
                });
            });
            var dbUID = $(obj).parents('tr')[0].id;
            var updateTrainData = {
                trainName: $(obj).parents('tr')[0].cells[1].innerHTML.trim(),
                trainDest: $(obj).parents('tr')[0].cells[2].innerHTML.trim(),
                firstTrain: moment($(obj).parents('tr')[0].cells[3].innerHTML.trim(), "HHmm").format("HH:mm"),
                trainFreq: $(obj).parents('tr')[0].cells[4].innerHTML.trim(),
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            }

            //push change up to firebase
            database.ref("train_schedule/"+dbUID).set(updateTrainData);
            
            //update table on change in firebase
            fbUpdate();
        }
        $(obj).html($(obj).html() == 'Edit' ? 'Save' : 'Edit')
    };

    //delete train 
    function deleteRow(obj){
        var dbUID = $(obj).parents('tr')[0].id;
        $(obj).parents('tr')[0].remove()
        database.ref("train_schedule/"+dbUID).remove()
    };

    //add new train
     $("#btnFrmSubmit").click( function(e){
         e.preventDefault();
         var empty = $(this).parent().find("input").filter(function() {
            return this.value === "";
        });
        if(empty.length == 0 ){
            $("#alert").remove();
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
        }else{
            $("#alert").remove();
            $("#frmTrain").prepend("<div id='alert'>Please fill out all fields</div>");
        }
        $("tr:gt(0)").remove();
        fbUpdate();
     });
     
     //update train
     function updateTrain(obj){
        database.ref("train_schedule").push(obj);

     };