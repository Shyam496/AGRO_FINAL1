// Script to clear all tasks on January 27, 2026
// Run this in your browser's console (F12) while on the calendar page

(function () {
    // Get current tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');

    console.log('Current tasks:', tasks);

    // Filter out all tasks for January 27, 2026
    const filteredTasks = tasks.filter(task => {
        return !task.dueDate.startsWith('2026-01-27');
    });

    console.log('Tasks after filtering:', filteredTasks);
    console.log(`Deleted ${tasks.length - filteredTasks.length} task(s) from Jan 27`);

    // Save back to localStorage
    localStorage.setItem('mock_tasks', JSON.stringify(filteredTasks));

    // Reload the page to see changes
    console.log('Reloading page...');
    window.location.reload();
})();
