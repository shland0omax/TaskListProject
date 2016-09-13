var index = 0;

var deleted = [];

function savetolocal() {
    var model = {};
    model.Name = $("#newName").val();
    model.IsCompleted = $("#newCompleted").is(":checked");
    model.IsDirty = true;
    var id = GenerateLocalId();
    model.ToDoId = id;
    localStorage.setItem(id,
        JSON.stringify(model));
    console.log("Logged.");
    return model;
}

var displayTasks = function(parentSelector, tasks) {
    $(parentSelector).empty();
    $.each(tasks, function(i, item) {
        appendRow(parentSelector, item);
    });
}

var appendRow = function (parentSelector, obj) {
    var tr = $("<tr data-id='" + obj.ToDoId + "'></tr>");
    tr.append("<td><input type='checkbox' class='completed' " + (obj.IsCompleted ? "checked" : "") + "/></td>");
    tr.append("<td class='name' >" + obj.Name + "</td>");
    tr.append("<td><input type='button' class='delete-button' value='Delete' /></td>");
    $(parentSelector).append(tr);
}

var createTask = function (isCompleted, name) {
    return $.post("/api/todos",
    {
        IsCompleted: isCompleted,
        Name: name
    });
};

var deleteTask = function (taskId) {
    return $.ajax({
        url: "/api/todos/" + taskId,
        type: 'DELETE'
    });
};

var disableButton = function () {
    $('#sync').prop("disabled", true);
    console.log("sync disabled");
}

var enableButton = function () {
    $('#sync').prop("disabled", false);
    console.log("sync enabled");
}

function GenerateLocalId() {
    while (localStorage.hasOwnProperty("l" + index)) {
        index++;
    }
    return "l" + (index++);
}

var loadTasks = function () {
    return $.getJSON("/api/todos");
};

$(function () {
    //localStorage.clear();
    //var tasks = [];
    //for (var item in localStorage) {
    //    tasks.push(JSON.parse(localStorage.getItem(item)));
    //}
    //displayTasks("#tasks > tbody", tasks);
    var items = loadTasks()
    .done(function (tasks) {
        displayTasks("#tasks > tbody", tasks);
        $.each(tasks, function (i, item) {
            localStorage.setItem(item.ToDoId,
                JSON.stringify(item));
        });
    });

    $("#newCreate").click(function(parent, tasks) {
        var obj = savetolocal();
        appendRow("#tasks > tbody", obj);
    });

    $('#tasks > tbody').on('click', '.delete-button', function (event) {
        var task = $(this).parent().parent();
        var id = task.attr("data-id");
        if (!isNaN(id)) {
            deleted.push(id);
        }
        localStorage.removeItem(id);
        task.remove();
    });

    $('#sync').click(function () {
        for (var item in localStorage) {
            var model = JSON.parse(localStorage.getItem(item));
            var isCompleted = model.IsCompleted;
            var name = model.Name;

            createTask(isCompleted, name)
                .then(disableButton)
                .done(enableButton);
            console.log("model added");

        }
        for (var i = 0; i < deleted.length; ++i) {
            deleteTask(deleted[i])
            .done(console.log("model deleted"));
        }

        loadTasks()
        .done(function (tasks) {
            displayTasks("#tasks > tbody", tasks);
        });
    });
});

