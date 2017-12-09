function Services() {
	return {

		//Requests
		createGraphRequest : function(numNodes) {
			if (isNaN(numNodes)) {
				window.alert("Could not create graph, please enter a valid number value.");
				return;
			}
			var request = new XMLHttpRequest();
			request.onreadystatechange = this.createGraph.bind(request);
			request.open("POST", "/graph/create/?nodes=" + numNodes, true);
			request.send();
		},


		//Responses
		createGraph : function() {
			if (this.readyState != 4) {
				return;
			}
			if (this.status == 200) {
				var graph = JSON.parse(this.response);
				Client.createGraphUI(graph);
			} else {
				console.warn("The request was not processed");
			}
		},
	}
}

Services = Services();
