

const start_game_button = document.querySelector(".start-game button")
var can_move = false


//start_game_button.addEventListener('click', () => {
//	start_game_checker_position()
//});



function get_our_checker_class() {
	return window.location.href.split("/").pop()
}


function get_opponent_checker_class() {
	if (window.location.href.split("/").pop() == "white"){
		return "black"
	}
	else if (window.location.href.split("/").pop() == "black"){
		return "white"
	}
}


function get_selected_checker() {
	return document.querySelector('.checker.selected')
}


function get_selected_position() {
	let selected_checker = get_selected_checker()
	let sq = selected_checker.parentElement.id.split("-")[1]
	let row = selected_checker.parentElement.parentElement.id.split("-")[1]

	return [row, sq]
}


function get_sq_by_position(sq_row, sq_sq){
	return document.querySelector(`#row-${sq_row} #sq-${sq_sq}`)
}


function get_sq_position(square) {
	let sq = square.id.split("-")[1]
	let row = square.parentElement.id.split("-")[1]

	return [row, sq]
}


function diffLessThanOrEqualOne(a, b) {
	let diff = Math.abs(a - b)
	return diff <= 1;
}


function diffEqualTwo(a, b){
	let diff = Math.abs(a - b)
	return diff == 2
}


function get_opponent_on_path(selected_sq, square_sq, square_row, selected_row) {
	let avg_sq = (selected_sq + square_sq) / 2
	let avg_row = (selected_row + square_row) / 2
	let square = document.querySelector(`#row-${avg_row} #sq-${avg_sq}`)

	return square
}


function has_opponent_checker_on_path(selected_sq, square_sq, square_row, selected_row){
	let opponent = get_opponent_on_path(selected_sq, square_sq, square_row, selected_row)

	if (opponent.hasChildNodes()){
		return opponent.firstChild.classList.contains(get_opponent_checker_class())
	}

	return false
}


function get_all_checkers_position(){
	let checkers = document.querySelectorAll('.checker')
	let checkers_position = []

	checkers.forEach(checker => {
		checkers_position.push(get_sq_position(checker.parentElement))
	})

	return checkers_position
}


function get_opponents_for_queen(selected_sq, square_sq, square_row, selected_row){
	let opponents = []
	let opp_sq = square_sq
	let opp_row = square_row

	while (true){
		if (square_sq>selected_sq){
			opp_sq = opp_sq-1
		}
		// if (square_sq<selected_sq)
		else {
			opp_sq = opp_sq+1
		}

		if (square_row>selected_row){
			opp_row = opp_row-1
		}
		//if (square_row<selected_row)
		else{
			opp_row = opp_row+1
		}

		if (opp_sq==selected_sq && opp_row==selected_row){
			break
		}
		else if(opp_sq>7 || opp_sq<0 || opp_row>7 || opp_row<0){
			return []
		}

		if (get_sq_by_position(opp_row, opp_sq).hasChildNodes()){
			
			if (!get_sq_by_position(opp_row, opp_sq).firstChild.classList.contains(get_our_checker_class())){
				opponents.push([opp_row, opp_sq])
			}
		}
	}

	return opponents
}


function get_hit_checkers() {
	return document.querySelectorAll('.hit')
}


function maby_state_queen(square){
	if (get_sq_position(square)[0] == 0 && square.hasChildNodes()
			&& get_our_checker_class() == "white"
			|| get_sq_position(square)[0] == 7 && square.hasChildNodes() 
			&& get_our_checker_class() == "black"){
		if (square.firstChild.classList.contains(get_our_checker_class())){
			square.firstChild.classList.add("queen")
		}
	}
}


function move_checker(){
	let squares = document.querySelectorAll('.square')
	let we = get_our_checker_class()
	
	squares.forEach(square => {
		square.addEventListener('click', () => {
			console.log(can_move)
			if (!can_move){
				return
			}

			if (!square.hasChildNodes()){
				let [selected_row, selected_sq] = get_selected_position()
				let [square_row, square_sq] = get_sq_position(square)
				
				selected_row = parseInt(selected_row)
				selected_sq = parseInt(selected_sq)
	
				square_row = parseInt(square_row)
				square_sq = parseInt(square_sq)

				// дамка
				if (get_selected_checker().classList.contains("queen")){
					if (Math.abs(square_sq-selected_sq) == Math.abs(square_row-selected_row)){
						var opponents = get_opponents_for_queen(selected_sq, square_sq, square_row, selected_row)
						//let opp_sq = square_sq
						//let opp_row = square_row
//
						//while (true){
						//	if (square_sq>selected_sq){
						//		opp_sq = opp_sq-1
						//	}
						//	else{
						//		opp_sq = opp_sq+1
						//	}
//
						//	if (square_row>selected_row){
						//		opp_row = opp_row-1
						//	}
						//	else{
						//		opp_row = opp_row+1
						//	}
//
						//	if (opp_sq==selected_sq){
						//		break
						//	}
//
//
						//	if (get_sq_by_position(opp_row, opp_sq).hasChildNodes()){
						//		opponents.push([opp_row, opp_sq])
						//	}
						//}

						if (opponents.length == 1){
							let opponent = opponents[0]
							let opp = get_sq_by_position(opponent[0], opponent[1]).firstChild
							if (!opp.classList.contains(we)){
								opp.remove()
								get_selected_checker().remove()

								select_checker()
								var hit = document.querySelectorAll(".hit")
								square.innerHTML = `<div class='checker ${we} queen'></div>`
								select_checker()

								if (hit.length != document.querySelectorAll(".hit").length){
									console.log("here")
									var move = get_our_checker_class()

									var [row, sq] = get_sq_position(square)
									var must_hit = {
										row: row,
										square: sq,
										color: get_our_checker_class()
									}
									
									square.firstChild.classList.add("must_hit")
									square.firstChild.classList.add("selected")
								}
								else{
									var move = get_opponent_checker_class()
									var must_hit = {}
								}

								send_checkers_pos(move, must_hit)
							}
						}
						else if(opponents.length == 0){
							get_selected_checker().remove()
			
							square.innerHTML = `<div class='checker ${we} queen'></div>`
							
							send_checkers_pos(get_opponent_checker_class(), {})
						}
					}
				}
				
				// обычна
				else if (selected_row-1 == square_row && get_our_checker_class() == "white"
						|| selected_row+1 == square_row && get_our_checker_class() == "black"){

					if (diffLessThanOrEqualOne(selected_sq, square_sq)
							&& square_sq != selected_sq){

						if (!square.hasChildNodes() && get_hit_checkers().length == 0){
							get_selected_checker().remove()
							square.innerHTML = `<div class='checker ${we}'></div>`
							maby_state_queen(square)
							send_checkers_pos(get_opponent_checker_class(), {})
						}
					}

				}
				
				// бой шашки
				else if (diffEqualTwo(selected_row, square_row) &&
						has_opponent_checker_on_path(selected_sq, square_sq, square_row, selected_row)){
					get_opponent_on_path(selected_sq, square_sq, square_row, selected_row).firstChild.remove()
					get_selected_checker().remove()

					select_checker()
					let hit = get_hit_checkers()
					console.log(hit)
					square.innerHTML = `<div class='checker ${we}'></div>`
					select_checker()

					if (hit.length != get_hit_checkers().length){
						console.log(get_our_checker_class())
						var move = get_our_checker_class()
						var [row, sq] = get_sq_position(square)
						var must_hit = {
							row: row,
							square: sq,
							color: get_our_checker_class()
						}
						
						square.firstChild.classList.add("must_hit")
						square.firstChild.classList.add("selected")

						console.log(square)
					}
					else{
						var move = get_opponent_checker_class()
						var must_hit = {}
					}

					maby_state_queen(square)
					send_checkers_pos(move, must_hit)
				}	
			}	
		});
	});
}


function start_game_checker_position() {
	rows = document.querySelectorAll(".row")

	for (let row of Array.from(rows).slice(0, 3)){
		opponent = get_opponent_checker_class()
		we = get_our_checker_class()
		for (let square of row.children){
			if (square.classList.contains("black")){
				square.innerHTML = `<div class='checker ${opponent}'></div>`
			}
		}
	}

	for (let row of Array.from(rows).slice(5, 8)){
		opponent = get_opponent_checker_class()
		we = get_our_checker_class()
		for (let square of row.children){
			if (square.classList.contains("black")){
				square.innerHTML = `<div class='checker ${we}'></div>`
			}
		}
	}
}


var select_color_group = document.querySelectorAll('.select-color div');


function select_checker_for_queen(opps){
	if (opps.length == 1){
		let opponent = opps[0]
		let opp = get_sq_by_position(opponent[0], opponent[1]).firstChild
		if (!opp.classList.contains(get_our_checker_class())){
			opp.classList.add('hit')
		}
	}
}


function select_checker() {
	checkers = document.querySelectorAll('.checker');

	// удалить старые выделеные шашки для битья
	selected_hit = document.querySelectorAll('.hit')

	selected_hit.forEach(checker => {
		checker.classList.remove('hit')
	})
	
	checkers.forEach(checker => {
		// при возможности побить еще выделить
		let [square_row, square_sq] = get_sq_position(checker.parentElement)
		square_row = parseInt(square_row)
		square_sq = parseInt(square_sq)

		for (let [future_row, future_sq] of [[square_row+2, square_sq-2], [square_row+2, square_sq+2],
			[square_row-2, square_sq-2], [square_row-2, square_sq+2]]){

			if (future_row >= 0 && future_row <= 7 && future_sq >= 0 && future_sq <= 7){
				if (has_opponent_checker_on_path(square_sq, future_sq, future_row, square_row)){
					if (!get_sq_by_position(future_row, future_sq).hasChildNodes()){
						if (checker.classList.contains(get_our_checker_class())){
							//checker.classList.add('selected')
							//checker.classList.add('hit')
							opponent = get_opponent_on_path(square_sq, future_sq, future_row, square_row)
							opponent.classList.add('hit')
						}
					}
				}
			}
		}


		// select queen
		if (checker.classList.contains("queen")){
			let [square_row, square_sq] = get_sq_position(checker.parentElement)
			square_row = parseInt(square_row)
			square_sq = parseInt(square_sq)
	
			for (let i = square_row, sc = square_sq; i<=7 && sc<=7; i+=1, sc+=1){
				let opps = get_opponents_for_queen(square_sq, sc, i, square_row)
				select_checker_for_queen(opps)
			}
	
			for (let i = square_row, sc = square_sq; i<=7 && sc>=0; i+=1, sc-=1){
				let opps = get_opponents_for_queen(square_sq, sc, i, square_row)
				select_checker_for_queen(opps)
			}
	

	
			for (let i = square_row, sc = square_sq; i>=0 && sc<=7; i-=1, sc+=1){
				let opps = get_opponents_for_queen(square_sq, sc, i, square_row)
				select_checker_for_queen(opps)
			}
	
			for (let i = square_row, sc = square_sq; i>=7 && sc>=7; i-=1, sc-=1){
				let opps = get_opponents_for_queen(square_sq, sc, i, square_row)
				select_checker_for_queen(opps)
			}
		}


		checker.addEventListener('click', () => {
			if (document.querySelector(".must_hit")){
				return
			}

			checkers.forEach(checker => {
				checker.classList.remove('selected');
			});
			if (checker.classList.contains(get_our_checker_class())){
				checker.classList.add('selected');
			}
		});
	});
}


function load_checker_position(){
	if (window.location.href.indexOf("/game/session/") == -1){
		return
	}

	let xhr = new XMLHttpRequest();

	xhr.onload = function() {
		var data = JSON.parse(xhr.responseText)

  	for (let checker_data of data["checkers"]){
  		let square = get_sq_by_position(checker_data["row"], checker_data["square"])

  		square.innerHTML = `<div class='checker ${checker_data["color"]}'></div>`

  		if (Object.keys(data["must_hit"]).length > 0){
  			if (data["must_hit"]["row"] == checker_data["row"]
						&& data["must_hit"]["square"] == checker_data["square"]
						&& data["must_hit"]["color"] == get_our_checker_class()){

					square.innerHTML = `<div class='checker ${checker_data["color"]} selected must_hit'></div>`
				}
  		}
  		if (checker_data["queen"]){
  			square.firstChild.classList.add("queen")
  		}	
  	}

  	can_move = (get_our_checker_class() == JSON.parse(xhr.responseText)["curren_move_color"])
	};

	let path_parts = window.location.href.split("/")
	let game_id = path_parts[path_parts.length-2]

	xhr.open('GET', `/api/table_state/${game_id}`, true);
	xhr.send();
}


function get_game_id(){
	let path_parts = window.location.href.split("/")
	let game_id = path_parts[path_parts.length-2]

	return game_id
}


function get_checkers_pos(){
	let checkers_pos = []

	checkers = document.querySelectorAll(".checker")

	for (let checker of checkers){
		let [row, sq] = get_sq_position(checker.parentElement)

		if (checker.classList.contains("white")){
			var color = "white"
		}
		else if (checker.classList.contains("black")){
			var color = "black"
		}
		
		var queen = checker.classList.contains("queen")
		checkers_pos.push({
			"row": row,
			"square": sq,
			"color": color,
			"queen": queen
		})
	}

	return checkers_pos
}


function reverse_board(){
	let rows = Array.from(document.querySelectorAll(".row")).reverse()
	let board = document.querySelector(".board")
	board.innerHTML = ""
	
	let counter = 0
	rows.forEach((row) => {
		//row.id.remove(`row-${7-counter}`)
		//row.classList.add(`row-${counter}`)
		let sqs = Array.from(row.children).reverse()
		row.children.innerHTML = ""

		for (sq of sqs){
			row.appendChild(sq)
		}



    board.appendChild(row);

    counter += 1
  })
}


function join_room(){
	var room_id = get_game_id()
	socket.emit('join_room', {room_id: room_id});
}


if (window.location.href.indexOf("game") == -1){
	select_color_group.forEach(select_color => {
  	select_color.addEventListener('click', () => {
  	  select_color_group.forEach(select_color => {
  	    select_color.classList.remove('selected');
  	  });
  	  select_color.classList.add('selected');
  	});
	});
}
else{
  select_color_group.forEach(select_color => {
      select_color.classList.remove('selected');
  });

  color_div = document.querySelector(`.select-${get_our_checker_class()}`)
  color_div.classList.add('selected')
}



setInterval(select_checker, 500)
setInterval(move_checker, 500)


load_checker_position()

if (window.location.href.split("/").pop() == "black"){
	reverse_board()
}



let socket = io();
join_room()

socket.on('connect', function() {
   console.log('Connected:', socket.id);

   // Пример подключения к комнате с идентификатором 'room1'
   var room_id = get_game_id();
   socket.emit('join_room', {room_id: room_id});
})

socket.on("table_state", function(data) {
	console.log(data)
	checkers = document.querySelectorAll(".checker")
	checkers.forEach(checker => {
		checker.remove()
	})

	for (let checker_data of data["checkers"]){
		let square = get_sq_by_position(checker_data["row"], checker_data["square"])

		square.innerHTML = `<div class='checker ${checker_data["color"]}'></div>`

		if (Object.keys(data["must_hit"]).length > 0){
			if (data["must_hit"]["row"] == checker_data["row"]
					&& data["must_hit"]["square"] == checker_data["square"]
					&& data["must_hit"]["color"] == get_our_checker_class()){
				square.innerHTML = `<div class='checker ${checker_data["color"]} selected must_hit'></div>`
			}
		}
  	if (checker_data["queen"]){
  		square.firstChild.classList.add("queen")
  	}
  }

  can_move = (get_our_checker_class() == data["curren_move_color"])
});


function send_checkers_pos(move, must_hit) {
	var board_state = {
		id: get_game_id(),
		checkers: get_checkers_pos(),
		curren_move_color: move,
		must_hit: must_hit
	}

	socket.emit("table_state", {room_id: get_game_id(), board_state: board_state});
}


//start_game_button = document.querySelector(".start-game-button")
var select_color = document.querySelector('.select-color .selected');

start_game_button.addEventListener('click', () => {
	window.location.assign(`/game/start/${select_color.classList[0].split("-")[1]}`)
})
