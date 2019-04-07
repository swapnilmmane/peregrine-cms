# things we have to document so people can understand it 

## change from htmtovue.js to incubate.js

htmltovue is to specific and wont allow us in the future to change from vue to something else
and is also not good right now since we support server side rendering (htl), vue and react. 

Since we renamed the process to hatching a while ago we can stay with the general bird/egg 
terminology here. 

lay (create) - incubate (grow into something) - hatch (be born)

now of course this terminology falls down a bit since we hatch the same component over and
over again but let's think about those as clones from the same or almost identical dna (our model). 

## allowedObjects

A folder under /content/objects can have a allowedObjects array propety. This array 
contains a list of the names of object types that are allowed to be created in the 
folder (and any subfolder [not implemented yet]) Need to decide if we also extend 
this to the objects for the ones that allow children to be created

## page components

a component is considered a page component if it's name is page or if a property 
templateComponent="true" is set on the component. This allows for the component to be 
used as a root component of a template and drives the list of the create template wizard

## group property of components

if a component has a property group that is set to .hidden then the component does not
show up in the component explorer to be dragged onto a page

## need to document the basic extension mechanism

apps/example/extensions is a sample of an extension for admin.pages. In general the page
defines an extension point with an id and the example project registers an extension for
that location. 

We still need to implement a way in the toolingpage/renderer.html to pull and define all
the extensions that can be found in the system. 

## percli changes to support author and publish node

`percli server start [-a|-p]`

## explain how distribution works

https://github.com/apache/sling/tree/trunk/contrib/extensions/distribution for more info

## documentation about the existing field types

we need to document the field types currently available in peregrine

## support for percli htmltovue * added

we can now compile all fragments at once with `percli htmltovue "*"` (On Unix systems the
star needs to be wrapped into double quotes to avoid greedy expasion). This can also be used
in the `ui.apps/packages.json` file (add to the beginning of build: 
`cd .. && percli htmltovue \"*\" && cd ui.apps &&` needs to be escaped with backslash
as this is a JSon file). **node** for archetype needs to be bumped to 7.10+

also mention `blockgenerator` file to block htmltovue on a component

## document support in percli for named servers