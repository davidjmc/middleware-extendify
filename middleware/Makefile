set:
	#sed -i "s/_HOST=.*/_HOST=$(IP)/g" examples/**/env.ini
	sed -i "s/_host':.*/_host':'$(IP)',/g" examples/**/variables.py

broker:
	mkdir -p generated/mex/broker/
	rm -rf generated/mex/broker/*
	mkdir -p generated/mex/broker/components/

	cp ../examples/pc/broker/mex.py generated/mex/broker/
	cp agent.py generated/mex/broker/

	cp classes/MessageStorage.py generated/mex/broker/
	cp classes/SubscriptionsManager.py generated/mex/broker/
	cp classes/SubscriptionStorage.py generated/mex/broker/
	
	cp ../examples/pc/broker/main.py generated/mex/broker/
	cp ../examples/pc/broker/app.py generated/mex/broker/
	# cp ../examples/pc/broker/configurations.py generated/mex/broker/

publisher:
	mkdir -p generated/mex/publisher/
	rm -rf generated/mex/publisher/*
	mkdir -p generated/mex/publisher/components/

	cp mex.py generated/mex/publisher/
	cp agent.py generated/mex/publisher/
	
	cp ../examples/pc/publisher/main.py generated/mex/publisher/
	cp ../examples/pc/publisher/app.py generated/mex/publisher/

subscriber:
	mkdir -p generated/mex/subscriber/
	rm -rf generated/mex/subscriber/*
	mkdir -p generated/mex/subscriber/components/

	cp mex.py generated/mex/subscriber/
	cp agent.py generated/mex/subscriber/
	
	cp ../examples/pc/subscriber/main.py generated/mex/subscriber/
	cp ../examples/pc/subscriber/app.py generated/mex/subscriber/

mqtt-publisher:
	mkdir -p generated/mqtt-publisher/
	rm -rf generated/mqtt-publisher/*
	mkdir -p generated/mqtt-publisher/components/

	cp agent.py generated/mqtt-publisher/
	cp amot.py generated/mqtt-publisher/

	cp examples/mqtt-publisher/app.py generated/mqtt-publisher/
	cp examples/mqtt-publisher/variables.py generated/mqtt-publisher/
	# cp examples/mqtt-publisher/env.ini generated/mqtt-publisher/
	cp examples/mqtt-publisher/main.py generated/mqtt-publisher/
	

mqtt-subscriber:
	mkdir -p generated/mqtt-subscriber/
	rm -rf generated/mqtt-subscriber/*
	mkdir -p generated/mqtt-subscriber/components/

	cp agent.py generated/mqtt-subscriber/
	cp amot.py generated/mqtt-subscriber/
	cp main.py generated/mqtt-subscriber/main.py

	cp examples/mqtt-subscriber/app.py generated/mqtt-subscriber/
	cp examples/mqtt-subscriber/variables.py generated/mqtt-subscriber/
	cp examples/mqtt-subscriber/main.py generated/mqtt-subscriber/


all:
	$(MAKE) broker
	$(MAKE) publisher
	$(MAKE) subscriber
	$(MAKE) mqtt-publisher
	$(MAKE) mqtt-subscriber


run-publisher:
	cd generated/mex/publisher && python3 main.py

run-subscriber:
	cd generated/mex/subscriber && python3 main.py

run-broker:
	cd generated/mex/broker && python3 main.py