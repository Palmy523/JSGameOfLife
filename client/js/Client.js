function Client() {
	return  {
		nodeCount : function() {
			var nodeCountInput = $('#nodeNumber');
			return nodeCountInput.val();
		},

		createGraphUI : function(graph) {
			var graphContainer = $('#graphContainer');
			var size = $('#size').val();
			size = (size || 50) + "px";
			graphContainer.empty();
			graph.uuids.forEach(function(uuid) {
				var div = $("<div>", {'id': uuid, 'class': 'graph-node', 'height': size, 'width': size});
				$('#graphContainer').append(div);
			});
		}
	}
}

Client = Client();