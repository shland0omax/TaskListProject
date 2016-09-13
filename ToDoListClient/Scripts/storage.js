var index = 0;

function savetolocal() {
    var model = {};
    model.Name = $("#newName").val();
    model.IsCompleted = $("#newCompleted").is(":checked");
    model.IsDirty = true;
    model.ToDoId = "l" + (index + 1);
    localStorage.setItem("l" + (++index),
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

var disableButton = function () {
    $('#sync').prop("disabled", true);
    console.log("sync disabled");
}

var enableButton = function () {
    $('#sync').prop("disabled", false);
    console.log("sync enabled");
}

$(function () {
    var tasks = [];
    for (var item in localStorage) {
        tasks.push(JSON.parse(localStorage.getItem(item)));
    }
    displayTasks("#tasks > tbody", tasks);

    $("#newCreate").click(function(parent, tasks) {
        var obj = savetolocal();
        appendRow("#tasks > tbody", obj);
    });

    $('#tasks > tbody').on('click', '.delete-button', function (event) {
        var task = $(this).parent().parent();
        var id = task.attr("data-id");
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
    });
});

