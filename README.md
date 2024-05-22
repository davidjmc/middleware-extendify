# MEx - Middleware Extendify

MEx is a comprehensive solution designed to assist developers in implementing and executing (self-)adaptive middleware systems tailored for IoT environments. MEx consists of both a framework and an underlying execution environment. The framework aims to facilitate the development of adaptive IoT middleware systems. The execution environment manages the functioning and adaptations in the middleware itself and the distributed applications that rely on it.

> MEx is an an acronym for `Middleware Extendify`, where `Extendify` is formed by blending the words `extend` and `modify`.

## Table of Contents

- [Installation](#installation)
- [Running the MEx](#running)
- [Team](#team)


## Installation

### Clone

- Clone this repository to your local machine using `git@github.com:davidjmc/middleware-extendify.git`

## Running the MEx

- Change to the MEx root directory cloned earlier

### Setup

- Go to the project's firebase database, navigate to the collection `Things`, and then to the documents `Broker, Publisher and Subscriber`. In the `configuration` field of these documents, set the local IP in the `broker_host` field.

Then:

 - From the root directory `cd examples\pc\broker` and configure the local IP in `AMOT_HOST` in the `main.py`
 - From the root directory `cd examples\pc\publisher` and configure the local IP in `AMOT_HOST` in the `main.py`
 - From the root directory `cd examples\pc\subscriber` and configure the local IP in `AMOT_HOST` in the `main.py`

> On the computer
### Run Managing System

 - From the root directory `cd managing-system` and execute `nodemon main.js`

### Run Broker

 - From the root directory `cd middleware` and execute `make broker`
 - From the root directory `cd middleware` and execute `make run-broker`

### Run Publisher

 - From the root directory `cd middleware` and execute `make publisher`
 - From the root directory `cd middleware` and execute `make run-publisher`

### Run Subscriber

 - From the root directory `cd middleware` and execute `make subscriber`
 - From root directory `cd middleware` and execute `make run-subscriber`

> On the thing

TODO

## Team

| **PhD Student** | **Collaborator** | **Collaborator** | **Professor** |
| :---: |:---:| :---:|:---:|
| [![PhD Student](https://raw.githubusercontent.com/davidjmc/mex/main/phd/team/david.jpeg)](http://lattes.cnpq.br/8585426872891843) | [![Research Collaborator](https://raw.githubusercontent.com/davidjmc/mex/main/phd/team/angelo.jpeg)](http://lattes.cnpq.br/9211915276537655) | [![Research Collaborator](https://raw.githubusercontent.com/davidjmc/mex/main/phd/team/ranieri.jpeg)](http://lattes.cnpq.br/9211915276537655) | [![Professor](https://raw.githubusercontent.com/davidjmc/mex/main/phd/team/nelson.jpeg)](http://lattes.cnpq.br/4220236737158909) |
| <a href="http://lattes.cnpq.br/8585426872891843" target="_blank">`David Cavalcanti`</a> | <a href="http://lattes.cnpq.br/9704149773345092" target="_blank">`Angelo Fernandes`</a> | <a href="http://lattes.cnpq.br/9211915276537655" target="_blank">`Ranieri Carvalho`</a> | <a href="http://lattes.cnpq.br/4220236737158909" target="_blank">`Nelson Rosa`</a> |

## References

- Books

  - M. Voelter, M. Kircher, and U. Zdun, Remoting Patterns: Foundations of Enterprise, Internet and Realtime Distributed Object Middleware, Pattern Series. John Wiley and Sons, 2004.

  - S. Tarkoma, Publish/Subscriber Systems: Design and Principles, 1st Edition, Wiley series in communications networking & distributed systems, Wiley, s.l., 2012, doi:10.1002/9781118354261.

- Journals and Papers

  - N.S. Rosa, G.M.M. Campos, and D.J.M. Cavalcanti, Lightweight formalisation of adaptive middleware, Journal of Systems Architecture, 2019, doi:10.1016/j.sysarc.2018.12.002.

- Frameworks, Tools and Technology

  - [How To Make Python Wait](https://blog.miguelgrinberg.com/post/how-to-make-python-wait), by Miguel Grinberg -- February 5, 2019
