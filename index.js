const db = firebase.firestore()

const form = document.querySelector('#task-form')
const taskContainer = document.querySelector('#tasks-container')

let editStatus = false
let id = ''

const saveTask = (title, description) =>
	db.collection('tasks').doc().set({
		title,
		description,
	})

const getTasks = () => db.collection('tasks').get()

// obtinen las tareas cada vez que se actualice
const onGetTasks = (callback) => db.collection('tasks').onSnapshot(callback)

const deleteTask = (id) => db.collection('tasks').doc(id).delete()

const getTask = (id) => db.collection('tasks').doc(id).get()

const updateTask = (id, updateTask) =>
	db.collection('tasks').doc(id).update(updateTask)

window.addEventListener('DOMContentLoaded', async (e) => {
	//const querySnapshot = await getTasks()

	// esto se ejecuta cada vez que suceda algo en la db
	onGetTasks((querySnapshot) => {
		taskContainer.innerHTML = ''

		querySnapshot.forEach((doc) => {
			const task = doc.data()
			task.id = doc.id

			taskContainer.innerHTML += `
				<div class="col-12 col-sm-5 card card-body mt-2 mx-2 border-success">
					<h3 class="text-primary">${task.title}</h3>
					<p>${task.description}</p>
	
					<div class="btn-group">
						<button class="btn btn-danger btn-delete" data-id="${task.id}">Delete</button>
						<button class="btn btn-info text-center px-3 btn-edit" data-id="${task.id}">Edit</button>
					</div>
				</div>
			`

			const btnsDelete = document.querySelectorAll('.btn-delete')

			btnsDelete.forEach((btn) => {
				btn.addEventListener('click', async (e) => {
					// obtenemos el id de data-id del dom
					// esto lo creamos
					const idTask = e.target.dataset.id
					await deleteTask(idTask)
					swal('Good job!', 'Task, DELETED successfully', 'success')
				})
			})

			const btnsEdit = document.querySelectorAll('.btn-edit')

			btnsEdit.forEach((btn) => {
				btn.addEventListener('click', async (e) => {
					const idTask = e.target.dataset.id
					// para obtener los datos de una tarea
					const doc = await getTask(idTask)
					const task = doc.data()

					editStatus = true
					id = idTask

					form['task-title'].value = task.title
					form['task-description'].value = task.description
					form['btn-task-form'].innerText = 'Update'
				})
			})
		})
	})
})

form.addEventListener('submit', async (e) => {
	e.preventDefault()

	const title = form['task-title']
	const description = form['task-description']

	if (!editStatus) {
		if (title.value === '' || description.value === '') {
			swal('Warning!', 'Complete all fields.', 'warning')
		} else {
			await saveTask(title.value, description.value)
			swal('Good job!', 'Task, SAVED successfully', 'success')
		}
	} else {
		if (title.value === '' || description.value === '') {
			swal('Warning!', 'Complete all fields.', 'warning')
		} else {
			await updateTask(id, {
				title: title.value,
				description: description.value,
			})
			swal('Good job!', 'Task, UPDATED successfully', 'success')

			editStatus = false
			id = ''
			form['btn-task-form'].innerText = 'Save'
		}
	}

	form.reset()
	title.focus()
})
